package com.rsindustries

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*

class GooglePayModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pendingPromise: Promise? = null
    private val TEZ_REQUEST_CODE = 5321

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "GooglePayTezNative"
    }

    @ReactMethod
    fun payWithGooglePay(vpa: String, name: String, amount: String, note: String, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Current activity is null")
            return
        }

        pendingPromise = promise

        try {
            val payeeName = if (name.isBlank()) "RS Industries" else name
            val txnRef = if (!note.isNullOrBlank()) note.replace(" ", "") else "RS${System.currentTimeMillis()}"
            val merchantCode = "BCR2DN6T36M4XDLR"
            
            val uriBuilder = Uri.Builder()
                .scheme("upi")
                .authority("pay")
                .appendQueryParameter("pa", vpa)
                .appendQueryParameter("pn", payeeName)
                .appendQueryParameter("mc", merchantCode)
                .appendQueryParameter("orgid", merchantCode)
                .appendQueryParameter("tr", txnRef)
                .appendQueryParameter("am", amount)
                .appendQueryParameter("cu", "INR")

            if (!note.isNullOrBlank()) {
                uriBuilder.appendQueryParameter("tn", note)
            }

            val uri = uriBuilder.build()

            val intent = Intent(Intent.ACTION_VIEW, uri)
            intent.setPackage("com.google.android.apps.nbu.paisa.user")

            if (intent.resolveActivity(activity.packageManager) != null) {
                activity.startActivityForResult(intent, TEZ_REQUEST_CODE)
            } else {
                val universalIntent = Intent(Intent.ACTION_VIEW, uri)
                activity.startActivityForResult(universalIntent, TEZ_REQUEST_CODE)
            }
        } catch (e: Exception) {
            pendingPromise?.reject("PAYMENT_ERROR", e.message, e)
            pendingPromise = null
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == TEZ_REQUEST_CODE) {
            val response = WritableNativeMap()
            val rawData = data?.getStringExtra("response") ?: ""

            if (resultCode == Activity.RESULT_OK) {
                response.putString("status", "SUCCESS")
                response.putString("raw", rawData)

                if (rawData.isNotEmpty()) {
                    val pairs = rawData.split("&")
                    for (pair in pairs) {
                        val parts = pair.split("=")
                        if (parts.size == 2) {
                            val key = parts[0].lowercase()
                            val value = parts[1]
                            if (key == "txnid" || key == "txnref" || key == "approvalrefno") {
                                response.putString("txnId", value)
                            }
                        }
                    }
                }
                pendingPromise?.resolve(response)
            } else {
                response.putString("status", "CANCELLED")
                response.putString("raw", rawData)
                pendingPromise?.resolve(response)
            }
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Unused
    }
}
