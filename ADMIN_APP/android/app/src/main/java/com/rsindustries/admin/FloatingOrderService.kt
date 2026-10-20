package com.rsindustries.admin

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class FloatingOrderService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var mediaPlayer: MediaPlayer? = null
    private val handler = Handler(Looper.getMainLooper())
    private var autoDismissRunnable: Runnable? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) return START_NOT_STICKY

        val action = intent.action
        if (action == ACTION_DISMISS) {
            dismissOverlay()
            stopSelf()
            return START_NOT_STICKY
        }

        // Check if device can draw over other apps
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            return START_NOT_STICKY
        }

        val orderId = intent.getStringExtra(EXTRA_ORDER_ID) ?: "N/A"
        val customerName = intent.getStringExtra(EXTRA_CUSTOMER_NAME) ?: "Customer"
        val totalAmount = intent.getStringExtra(EXTRA_TOTAL_AMOUNT) ?: "0"
        val itemsCount = intent.getStringExtra(EXTRA_ITEMS_COUNT) ?: "1"

        showOverlay(orderId, customerName, totalAmount, itemsCount)
        playAlertSound()

        // Auto dismiss after 60 seconds if unattended
        autoDismissRunnable?.let { handler.removeCallbacks(it) }
        autoDismissRunnable = Runnable {
            dismissOverlay()
            stopSelf()
        }
        handler.postDelayed(autoDismissRunnable!!, 60000)

        return START_NOT_STICKY
    }

    private fun showOverlay(orderId: String, customerName: String, totalAmount: String, itemsCount: String) {
        dismissOverlay() // Remove any existing overlay

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            x = 0
            y = dpToPx(32)
        }

        // Outer Container (Margin wrapper)
        val outerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(16), 0, dpToPx(16), 0)
        }

        // Card Container
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dpToPx(24).toFloat()
                setStroke(dpToPx(1), Color.parseColor("#E2E8F0"))
            }
            elevation = dpToPx(12).toFloat()
            setPadding(dpToPx(18), dpToPx(16), dpToPx(18), dpToPx(16))
        }

        // Header Row (Brand & Bell)
        val headerRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val badgeDot = TextView(this).apply {
            text = "🔔 "
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        }

        val titleText = TextView(this).apply {
            text = "RS ENTERPRISES • NEW ORDER!"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            setTextColor(Color.parseColor("#006948")) // RS Brand Green
            paint.isFakeBoldText = true
            letterSpacing = 0.08f
        }

        headerRow.addView(badgeDot)
        headerRow.addView(titleText)
        card.addView(headerRow)

        // Order ID Text
        val orderIdView = TextView(this).apply {
            text = "Order #$orderId"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
            setTextColor(Color.parseColor("#0F172A"))
            paint.isFakeBoldText = true
            setPadding(0, dpToPx(6), 0, dpToPx(2))
        }
        card.addView(orderIdView)

        // Customer & Items Row
        val customerView = TextView(this).apply {
            text = "Buyer: $customerName • $itemsCount item(s)"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextColor(Color.parseColor("#64748B"))
        }
        card.addView(customerView)

        // Amount Display Row
        val amountView = TextView(this).apply {
            text = "Total: ₹$totalAmount"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
            setTextColor(Color.parseColor("#006948"))
            paint.isFakeBoldText = true
            setPadding(0, dpToPx(8), 0, dpToPx(12))
        }
        card.addView(amountView)

        // Action Buttons Row
        val btnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val dismissBtn = Button(this).apply {
            text = "Dismiss"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextColor(Color.parseColor("#475569"))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#F1F5F9"))
                cornerRadius = dpToPx(14).toFloat()
            }
            layoutParams = LinearLayout.LayoutParams(0, dpToPx(44), 1f).apply {
                marginEnd = dpToPx(8)
            }
            setOnClickListener {
                dismissOverlay()
                stopSelf()
            }
        }

        val viewOrderBtn = Button(this).apply {
            text = "View Order →"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextColor(Color.WHITE)
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#006948"))
                cornerRadius = dpToPx(14).toFloat()
            }
            layoutParams = LinearLayout.LayoutParams(0, dpToPx(44), 1.4f)
            setOnClickListener {
                dismissOverlay()
                // Launch MainActivity bringing RS Admin to foreground
                val openIntent = Intent(this@FloatingOrderService, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("orderId", orderId)
                }
                startActivity(openIntent)
                stopSelf()
            }
        }

        btnRow.addView(dismissBtn)
        btnRow.addView(viewOrderBtn)
        card.addView(btnRow)

        outerLayout.addView(card)
        floatingView = outerLayout

        try {
            windowManager?.addView(floatingView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun playAlertSound() {
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer.create(this, R.raw.order_alert)?.apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                        .build()
                )
                start()
                setOnCompletionListener {
                    it.release()
                    mediaPlayer = null
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun dismissOverlay() {
        autoDismissRunnable?.let { handler.removeCallbacks(it) }
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (_: Exception) {}

        if (floatingView != null && windowManager != null) {
            try {
                windowManager?.removeView(floatingView)
            } catch (_: Exception) {}
            floatingView = null
        }
    }

    override fun onDestroy() {
        dismissOverlay()
        super.onDestroy()
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    companion object {
        const val ACTION_SHOW = "com.rsindustries.admin.ACTION_SHOW_ORDER"
        const val ACTION_DISMISS = "com.rsindustries.admin.ACTION_DISMISS_ORDER"
        const val EXTRA_ORDER_ID = "orderId"
        const val EXTRA_CUSTOMER_NAME = "customerName"
        const val EXTRA_TOTAL_AMOUNT = "totalAmount"
        const val EXTRA_ITEMS_COUNT = "itemsCount"
    }
}
