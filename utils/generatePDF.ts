import { ChatGPTMessage } from '../components/ChatLine'

export async function downloadConversationAsPDF(messages: ChatGPTMessage[]) {
  // Dynamic import for jsPDF to avoid SSR issues
  if (typeof window === 'undefined') {
    console.error('PDF generation is only available in the browser')
    return
  }

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Add title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Alan AI - Conversation', margin, yPosition)
  yPosition += 15

  // Add date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition)
  yPosition += 10

  // Add separator line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15

  // Process each message
  messages.forEach((message, index) => {
    const isAssistant = message.role === 'assistant'
    const speaker = isAssistant ? 'Alan' : 'You'
    
    // Check if we need a new page
    checkPageBreak(25)

    // Add speaker label
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    if (isAssistant) {
      doc.setTextColor(0, 100, 200) // Blue for Alan
    } else {
      doc.setTextColor(0, 0, 0) // Black for user
    }
    doc.text(`${speaker}:`, margin, yPosition)
    yPosition += 8

    // Add message content
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(message.content || '', maxWidth)
    
    // Check if content fits on current page
    const contentHeight = lines.length * 5 + 5
    if (yPosition + contentHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    // Add text lines
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin + 5, yPosition)
      yPosition += 5
    })

    yPosition += 10 // Space between messages

    // Add separator line between messages (except after last one)
    if (index < messages.length - 1) {
      if (yPosition > pageHeight - margin - 5) {
        doc.addPage()
        yPosition = margin
      }
      doc.setDrawColor(230, 230, 230)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  })

  // Add footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages} - Alan AI Conversation`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `alan-ai-conversation-${timestamp}.pdf`

  // Save the PDF
  doc.save(filename)
}

