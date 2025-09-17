'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  BarChart3,
  Clock,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { StatisticsChartProps } from '@/types/scheduler'

export default function StatisticsChart({
  data,
  chartType,
  timeRange = '24h',
  height = 300,
  loading = false,
  onTimeRangeChange,
}: StatisticsChartProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const colors = useMemo(() => [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ], [])

  const timeRangeOptions = [
    { value: '24h', label: '24小時' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
  ]

  const chartTypeIcons = {
    'success-rate': TrendingUp,
    'execution-count': BarChart3,
    'duration': Clock,
    'timeline': Activity,
  }

  const chartTypeTitles = {
    'success-rate': '成功率分析',
    'execution-count': '執行次數統計',
    'duration': '執行時間分析',
    'timeline': '時間軸視圖',
  }

  const filteredData = useMemo(() => {
    if (selectedTasks.length === 0) return data
    return data.filter(item => selectedTasks.includes(item.task_name))
  }, [data, selectedTasks])

  const processedData = useMemo(() => {
    switch (chartType) {
      case 'success-rate':
        return filteredData.map((item, index) => ({
          name: item.task_name,
          successRate: item.success_rate,
          totalExecutions: item.total_executions,
          color: colors[index % colors.length],
        }))

      case 'execution-count':
        return filteredData.map((item, index) => ({
          name: item.task_name,
          successful: item.successful_executions,
          failed: item.failed_executions,
          total: item.total_executions,
          color: colors[index % colors.length],
        }))

      case 'duration':
        return filteredData.map((item, index) => ({
          name: item.task_name,
          average: Math.round(item.average_duration_ms / 1000), // Convert to seconds
          min: Math.round(item.min_duration_ms / 1000),
          max: Math.round(item.max_duration_ms / 1000),
          color: colors[index % colors.length],
        }))

      case 'timeline':
        return filteredData.map((item, index) => ({
          name: item.task_name,
          last24h: item.last_24h_executions,
          last7d: item.last_7d_executions,
          last30d: item.last_30d_executions,
          color: colors[index % colors.length],
        }))

      default:
        return []
    }
  }, [filteredData, chartType, colors])

  const toggleTaskSelection = (taskName: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskName)) {
        return prev.filter(name => name !== taskName)
      } else {
        return [...prev, taskName]
      }
    })
  }

  const clearSelection = () => {
    setSelectedTasks([])
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ color: string; dataKey: string; value: number | string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${getUnit(chartType, entry.dataKey)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getUnit = (type: string, dataKey: string) => {
    switch (type) {
      case 'success-rate':
        return dataKey === 'successRate' ? '%' : ''
      case 'duration':
        return 's'
      default:
        return ''
    }
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )
    }

    if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暫無資料</h3>
            <p className="text-gray-500">選擇不同的時間範圍或等待資料載入。</p>
          </div>
        </div>
      )
    }

    switch (chartType) {
      case 'success-rate':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="successRate" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'execution-count':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="successful" stackId="a" fill="#10B981" />
              <Bar dataKey="failed" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'duration':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="average" fill="#3B82F6" />
              <Bar dataKey="max" fill="#F59E0B" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="last24h" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="last7d" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="last30d" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const IconComponent = chartTypeIcons[chartType]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IconComponent className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{chartTypeTitles[chartType]}</h3>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <div className="flex items-center space-x-2">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimeRangeChange(option.value as '24h' | '7d' | '30d')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === option.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Filter */}
      {data.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">篩選任務:</span>
            {selectedTasks.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                清除篩選
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.map((item, index) => (
              <button
                key={item.task_name}
                onClick={() => toggleTaskSelection(item.task_name)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedTasks.length === 0 || selectedTasks.includes(item.task_name)
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedTasks.length === 0 || selectedTasks.includes(item.task_name)
                    ? colors[index % colors.length] + '20'
                    : undefined,
                  borderColor: selectedTasks.length === 0 || selectedTasks.includes(item.task_name)
                    ? colors[index % colors.length]
                    : undefined,
                }}
              >
                {item.task_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        {renderChart()}
      </div>

      {/* Legend */}
      {chartType === 'execution-count' && (
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-sm text-gray-600">成功</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className="text-sm text-gray-600">失敗</span>
          </div>
        </div>
      )}

      {chartType === 'duration' && (
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-sm text-gray-600">平均時間</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm opacity-60" />
            <span className="text-sm text-gray-600">最長時間</span>
          </div>
        </div>
      )}

      {chartType === 'timeline' && (
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-sm text-gray-600">24小時</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-sm text-gray-600">7天</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
            <span className="text-sm text-gray-600">30天</span>
          </div>
        </div>
      )}
    </div>
  )
}