export const exportFile = (fileName: string, content: string, type = 'json') => {
    const link = document.createElement('a')
    const blob = new Blob([content], { type: `text/${type};charset=utf-8;` })
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
