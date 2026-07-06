"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { getEmployeeCashTransactionStatistics } from "@/app/services/api/employeeCashTransactions"
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_CURRENCY, LOCALE } from '@/app/finance/constants';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const getChartConfig = (t) => ({
  views: {
    label: t('transactionsLabel'),
  },
  credit: {
    label: t('credit'),
    color: "hsl(var(--chart-1))",
  },
  debit: {
    label: t('debit'),
    color: "hsl(var(--chart-2))",
  },
})

export default function Transactions() {
  const t = useTranslations('financeStatistics');
  const commonT = useTranslations('common');
  const { isRTL, language } = useLanguage();
  const chartConfig = React.useMemo(() => getChartConfig(t), [t]);
  const [activeChart, setActiveChart] = React.useState("credit")
  const [chartData, setChartData] = React.useState([])
  const [summary, setSummary] = React.useState({
    total_credit: 0,
    total_debit: 0,
    total_credit_count: 0,
    total_debit_count: 0
  })
  const [loading, setLoading] = React.useState(true)
  const [period, setPeriod] = React.useState("last_month")

  // Fetch transaction statistics
  React.useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        const data = await getEmployeeCashTransactionStatistics({
          period,
          type: 'both',
          group_by: 'day'
        })
        
        if (data.success) {
          setChartData(Array.isArray(data.data?.chart_data) ? data.data.chart_data : [])
          setSummary(data.data?.summary || {
            total_credit: 0,
            total_debit: 0,
            total_credit_count: 0,
            total_debit_count: 0
          })
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [period])

  const total = React.useMemo(
    () => ({
      credit: summary.total_credit,
      debit: summary.total_debit,
    }),
    [summary]
  )

  if (loading) {
    return (
      <Card className="py-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-muted-foreground">{commonT('loading')}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-6">
          <CardTitle>{t('transactionsStatistics')}</CardTitle>
          <CardDescription>
            {t('transactionsStatisticsDescription')}
          </CardDescription>
        </div>
        <div className="flex">
          {["credit", "debit"].map((key) => {
            const chart = key 
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-start even:border-s sm:border-t-0 sm:border-s sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key].toLocaleString()} {commonT('currency')}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full min-w-0"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(language === 'ar' ? "ar-AE" : "en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(language === 'ar' ? "ar-AE" : "en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

