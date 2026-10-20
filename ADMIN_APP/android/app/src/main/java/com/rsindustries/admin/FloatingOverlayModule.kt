package com.rsindustries.admin

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class FloatingOverlayModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FloatingOverlayModule"

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_PERMISSION", e.message)
        }
    }

    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                ).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun showFloatingOrder(orderData: ReadableMap) {
        try {
            val intent = Intent(reactContext, FloatingOrderService::class.java).apply {
                action = FloatingOrderService.ACTION_SHOW
                putExtra(FloatingOrderService.EXTRA_ORDER_ID, if (orderData.hasKey("orderId")) orderData.getString("orderId") else "N/A")
                putExtra(FloatingOrderService.EXTRA_CUSTOMER_NAME, if (orderData.hasKey("customerName")) orderData.getString("customerName") else "Customer")
                putExtra(FloatingOrderService.EXTRA_TOTAL_AMOUNT, if (orderData.hasKey("totalAmount")) orderData.getString("totalAmount") else "0")
                putExtra(FloatingOrderService.EXTRA_ITEMS_COUNT, if (orderData.hasKey("itemsCount")) orderData.getString("itemsCount") else "1")
            }
            reactContext.startService(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun dismissFloatingOrder() {
        try {
            val intent = Intent(reactContext, FloatingOrderService::class.java).apply {
                action = FloatingOrderService.ACTION_DISMISS
            }
            reactContext.startService(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun getInitialOrderId(promise: Promise) {
        try {
            val activity = reactContext.currentActivity
            val orderId = activity?.intent?.getStringExtra("orderId")
            promise.resolve(orderId)
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }
}
