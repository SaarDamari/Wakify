package com.wakify

import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
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
    ensureFullScreenIntentPermission()
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
   * Android 14 (API 34) no longer auto-grants USE_FULL_SCREEN_INTENT to general
   * apps — without it the OS demotes the alarm to a heads-up banner and won't
   * wake a locked screen. Send the user to the system toggle once.
   */
  private fun ensureFullScreenIntentPermission() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      return
    }
    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (nm.canUseFullScreenIntent()) {
      return
    }
    val prefs = getSharedPreferences("wakify", Context.MODE_PRIVATE)
    if (prefs.getBoolean("fsi_prompted", false)) {
      return
    }
    prefs.edit().putBoolean("fsi_prompted", true).apply()
    try {
      startActivity(
        Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
          .setData(Uri.parse("package:$packageName")),
      )
    } catch (e: Exception) {
      // Settings screen unavailable on this device/OEM — ignore.
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
