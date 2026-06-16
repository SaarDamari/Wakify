package com.wakify

import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray

/**
 * Native bridge that lets the JS layer (a) check/request the OS permissions an
 * alarm app needs to wake a locked, idle device on Android 14+, and (b) force the
 * ring activity to the foreground (with a screen wakelock) when the full-screen
 * intent has been demoted to a banner — the belt-and-suspenders path used by the
 * background handler so Scenarios 3 & 4 (screen off, app bg/killed) always ring.
 */
class WakifyAlarmModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WakifyAlarm"

  // MediaPlayer for the fallback system ringtone (played by the ring screen when
  // Spotify fails / hasn't connected). Held so stopRingtone() can release it.
  private var ringtonePlayer: MediaPlayer? = null

  // --- System ringtones (fallback alarm sound) ------------------------------

  /** Return the device's alarm + ringtone sounds as [{ title, uri }], with a
   *  leading "Default alarm sound" entry (empty uri) meaning "use the OS default". */
  @ReactMethod
  fun getRingtones(promise: Promise) {
    try {
      val out: WritableArray = Arguments.createArray()
      val seen = HashSet<String>()

      out.pushMap(
        Arguments.createMap().apply {
          putString("title", "Default alarm sound")
          putString("uri", "")
        },
      )

      for (type in intArrayOf(RingtoneManager.TYPE_ALARM, RingtoneManager.TYPE_RINGTONE)) {
        val manager = RingtoneManager(reactContext)
        manager.setType(type)
        val cursor = manager.cursor
        while (cursor.moveToNext()) {
          val pos = cursor.position
          val uri = manager.getRingtoneUri(pos)?.toString() ?: continue
          if (!seen.add(uri)) {
            continue
          }
          val title =
            cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX) ?: "Ringtone"
          out.pushMap(
            Arguments.createMap().apply {
              putString("title", title)
              putString("uri", uri)
            },
          )
        }
      }
      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("ringtones_failed", e)
    }
  }

  /** Loop a system ringtone (alarm stream, so it sounds under DnD). Empty uri =>
   *  the OS default alarm. [volume] is 0..1 applied to this player directly. */
  @ReactMethod
  fun playRingtone(uriString: String?, volume: Double) {
    try {
      stopRingtonePlayer()
      val uri =
        if (uriString.isNullOrEmpty()) {
          RingtoneManager.getActualDefaultRingtoneUri(
            reactContext,
            RingtoneManager.TYPE_ALARM,
          )
            ?: RingtoneManager.getActualDefaultRingtoneUri(
              reactContext,
              RingtoneManager.TYPE_RINGTONE,
            )
        } else {
          Uri.parse(uriString)
        } ?: return
      val v = volume.coerceIn(0.0, 1.0).toFloat()
      ringtonePlayer =
        MediaPlayer().apply {
          setAudioAttributes(
            AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_ALARM)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build(),
          )
          isLooping = true
          setDataSource(reactContext, uri)
          prepare()
          setVolume(v, v)
          start()
        }
    } catch (e: Exception) {
      // Never crash the ring screen on a bad/unplayable uri.
      stopRingtonePlayer()
    }
  }

  @ReactMethod
  fun stopRingtone() {
    stopRingtonePlayer()
  }

  private fun stopRingtonePlayer() {
    try {
      ringtonePlayer?.let { p ->
        if (p.isPlaying) {
          p.stop()
        }
        p.release()
      }
    } catch (e: Exception) {
      // best-effort
    } finally {
      ringtonePlayer = null
    }
  }

  // --- Full-screen intent (Android 14+ revokes this by default) -------------

  @ReactMethod
  fun canUseFullScreenIntent(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        promise.resolve(true)
        return
      }
      val nm =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      promise.resolve(nm.canUseFullScreenIntent())
    } catch (e: Exception) {
      promise.resolve(true) // never block the UI on a probe failure
    }
  }

  @ReactMethod
  fun openFullScreenIntentSettings() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      return
    }
    startSettings(
      Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
        .setData(Uri.parse("package:${reactContext.packageName}")),
    )
  }

  // --- Display over other apps (enables background activity launch) ----------

  @ReactMethod
  fun canDrawOverlays(promise: Promise) {
    try {
      promise.resolve(Settings.canDrawOverlays(reactContext))
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun openOverlaySettings() {
    startSettings(
      Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
        .setData(Uri.parse("package:${reactContext.packageName}")),
    )
  }

  // --- Battery optimization (critical on Samsung / aggressive OEMs) ----------

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    try {
      val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
      promise.resolve(pm.isIgnoringBatteryOptimizations(reactContext.packageName))
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  @Suppress("BatteryLife")
  fun openBatteryOptimizationSettings() {
    // Direct request dialog where allowed; fall back to the app's settings list.
    val request =
      Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:${reactContext.packageName}"))
    if (request.resolveActivity(reactContext.packageManager) != null) {
      startSettings(request)
    } else {
      startSettings(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    }
  }

  // --- Forced screen + activity wake ----------------------------------------

  /**
   * Power the screen on and bring the ring activity to the front from the
   * background. Used by the alarm background handler when the full-screen intent
   * didn't auto-launch. Acquires a brief screen-bright wakelock (Samsung firmware
   * often ignores Activity.setTurnScreenOn alone) and a partial wakelock so the
   * headless JS finishes connecting to Spotify before Doze suspends the CPU.
   */
  @ReactMethod
  fun launchAlarmActivity() {
    try {
      acquireWakeLocks()
      dismissKeyguardIfPossible()
      val intent =
        Intent(reactContext, MainActivity::class.java).apply {
          addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK or
              Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
              Intent.FLAG_ACTIVITY_SINGLE_TOP,
          )
        }
      reactContext.startActivity(intent)
    } catch (e: Exception) {
      // Background-activity-start blocked (no overlay grant) — the notification's
      // full-screen intent / tap remains as the fallback. Never crash the handler.
    }
  }

  private fun acquireWakeLocks() {
    try {
      val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
      @Suppress("DEPRECATION")
      val screen =
        pm.newWakeLock(
          PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
            PowerManager.ACQUIRE_CAUSES_WAKEUP or
            PowerManager.ON_AFTER_RELEASE,
          "wakify:alarm-screen",
        )
      screen.acquire(15_000L) // auto-release; the Activity then keeps the screen on
      val partial =
        pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "wakify:alarm-cpu")
      partial.acquire(30_000L) // keep CPU alive long enough to start Spotify
    } catch (e: Exception) {
      // best-effort
    }
  }

  private fun dismissKeyguardIfPossible() {
    try {
      val km = reactContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      reactContext.currentActivity?.let { activity ->
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
          km.requestDismissKeyguard(activity, null)
        }
      }
    } catch (e: Exception) {
      // best-effort
    }
  }

  private fun startSettings(intent: Intent) {
    val activity = reactContext.currentActivity
    try {
      if (activity != null) {
        activity.startActivity(intent)
      } else {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
      }
    } catch (e: Exception) {
      // Settings screen unavailable on this OEM — ignore.
    }
  }
}
