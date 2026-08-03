package com.robertocondoleo.bitacora

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

// Widget simple de "pasos de hoy" para la pantalla principal. Lee directo
// de Health Connect (no depende de la web ni de internet), así que
// funciona aunque la app esté cerrada. Android decide cada cuánto lo
// refresca (mínimo ~30 min); tocar el widget abre la app y fuerza una
// actualización también.
class StepsWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) {
            updateWidget(context, appWidgetManager, id)
        }
    }

    private fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val pendingIntent = launchAppPendingIntent(context)
        val initialViews = RemoteViews(context.packageName, R.layout.widget_steps)
        initialViews.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
        appWidgetManager.updateAppWidget(appWidgetId, initialViews)

        CoroutineScope(Dispatchers.IO).launch {
            val steps = fetchTodaySteps(context)
            val views = RemoteViews(context.packageName, R.layout.widget_steps)
            views.setTextViewText(R.id.widget_steps_value, formatSteps(steps))
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    private fun launchAppPendingIntent(context: Context): PendingIntent {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        return PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun formatSteps(steps: Long?): String {
        if (steps == null) return "—"
        return "%,d".format(steps).replace(",", ".")
    }

    private suspend fun fetchTodaySteps(context: Context): Long? {
        return try {
            if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) return null
            val client = HealthConnectClient.getOrCreate(context)
            val zone = ZoneId.systemDefault()
            val startOfDay = LocalDate.now(zone).atStartOfDay(zone).toInstant()
            val now = Instant.now()
            val response: AggregationResult = client.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                )
            )
            response[StepsRecord.COUNT_TOTAL] ?: 0L
        } catch (e: Exception) {
            null
        }
    }
}
