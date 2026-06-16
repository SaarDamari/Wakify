package com.wakify

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Wakify"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showWhenLockedAndTurnScreenOn()
    forceScreenOn()
  }

  /**
   * Scenario 3 (app already alive, screen off): the full-screen intent / forced
   * launch arrives as a new intent on the existing activity, so onCreate does NOT
   * run again. Re-apply the wake path here so the screen still turns on.
   */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    showWhenLockedAndTurnScreenOn()
    forceScreenOn()
  }

  /**
   * When an alarm's full-screen intent launches this activity on a locked device,
   * show over the keyguard and wake the screen. The window flags keep the screen
   * on while ringing and allow showing above the lock screen.
   */
  private fun showWhenLockedAndTurnScreenOn() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
      val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
      keyguard?.requestDismissKeyguard(this, null)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD,
      )
    }
    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON,
    )
  }

  /**
   * setTurnScreenOn alone is unreliable on some Samsung firmware. Acquire a brief
   * screen-bright wakelock to physically power the display on, then auto-release;
   * the FLAG_KEEP_SCREEN_ON window flag keeps it lit while the ring screen is up.
   */
  private fun forceScreenOn() {
    try {
      val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
      @Suppress("DEPRECATION")
      val wl =
        pm.newWakeLock(
          PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
            PowerManager.ACQUIRE_CAUSES_WAKEUP or
            PowerManager.ON_AFTER_RELEASE,
          "wakify:activity-screen",
        )
      wl.acquire(10_000L)
    } catch (e: Exception) {
      // best-effort — window flags remain as the fallback
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
