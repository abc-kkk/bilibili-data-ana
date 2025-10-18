document.addEventListener('DOMContentLoaded', () => {
  // 获取所有UI元素
  const mainActionArea = document.getElementById('main-action-area')
  const statusMessage = document.getElementById('status-message')
  const analyzeButton = document.getElementById('analyze-button')
  const resultArea = document.getElementById('result-area')
  const resultMessage = document.getElementById('result-message')
  const downloadButton = document.getElementById('download-button')

  let videoData = []

  // 初始化：检查当前标签页URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]
    if (currentTab && currentTab.url && currentTab.url.startsWith('https://space.bilibili.com/')) {
      statusMessage.textContent = '已准备就绪，随时可以分析！'
      analyzeButton.disabled = false
    } else {
      statusMessage.textContent = '请先进入一个B站UP主的个人空间。'
      analyzeButton.disabled = true
    }
  })

  // 分析按钮点击事件
  analyzeButton.addEventListener('click', () => {
    analyzeButton.disabled = true
    // 优化提示
    statusMessage.textContent = '分析中... 如果UP主视频较多，可能需要几十秒，请耐心等待。'

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const midMatch = tabs[0].url.match(/space\.bilibili\.com\/(\d+)/)
      if (!midMatch) {
        statusMessage.textContent = '无法从当前URL中提取UP主ID。'
        analyzeButton.disabled = false
        return
      }
      const mid = midMatch[1]

      // 直接向后台发送分析请求
      chrome.runtime.sendMessage({
        type: "FETCH_VIDEOS",
        mid: mid
      }, (response) => {
        if (response && response.success) {
          videoData = response.data
          mainActionArea.style.display = 'none'
          resultArea.style.display = 'block'
          resultMessage.textContent = `分析完成！共找到 ${videoData.length} 条视频。`
        } else {
          statusMessage.textContent = `分析失败: ${response ? response.error : '未知错误'}`
          analyzeButton.disabled = false
        }
      })
    })
  })

  // 下载按钮点击事件
  downloadButton.addEventListener('click', () => {
    if (videoData.length === 0) return

    // 更新表头：移除了“点赞量”和“点赞率”
    const header = "标题,发布时间,观看量,弹幕数,评论量,时长,BVID,视频链接,评论率(%)\n"

    const rows = videoData.map(v => {
      const title = `"${(v.title || '').replace(/"/g, '""')}"`
      const created = new Date(v.created * 1000).toLocaleString()
      const playCount = v.play || 0

      // 更新互动率计算：移除了点赞率
      const commentRate = playCount > 0 ? ((v.comment / playCount) * 100).toFixed(2) : '0.00'

      // 更新数据列：移除了点赞量相关数据
      return [
        title,
        created,
        playCount,
        v.video_review, // 弹幕数
        v.comment,
        v.length,       // 时长
        v.bvid,
        `https://www.bilibili.com/video/${v.bvid}`,
        commentRate
      ].join(',')
    }).join('\n')

    const csvContent = "\uFEFF" + header + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const upName = videoData[0] ? videoData[0].author : 'unknown_up'
    a.href = url
    a.download = `bilibili_videos_${upName}_${new Date().getTime()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  })
});

