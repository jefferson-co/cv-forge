import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { CVFormData } from '@/types/cv';

// ATS-optimized PDF generation with optional photo support
export const generatePDF = async (formData: CVFormData, includePhoto: boolean = false): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let maxWidth = pageWidth - margin * 2;
  let y = 20;
  let headerXOffset = margin;

  // If photo should be included, add it to the top right
  if (includePhoto && formData.photoUrl) {
    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = formData.photoUrl;
      });
      
      // Add photo to top right (35x45mm passport size)
      const photoWidth = 35;
      const photoHeight = 45;
      const photoX = pageWidth - margin - photoWidth;
      doc.addImage(img, 'JPEG', photoX, y, photoWidth, photoHeight);
      
      // Adjust max width for header section to not overlap photo
      maxWidth = pageWidth - margin * 2 - photoWidth - 5;
    } catch (error) {
      console.error('Failed to load photo for PDF:', error);
      // Continue without photo if loading fails
    }
  }

  // Helper function to add text with word wrap (ATS-friendly plain text)
  const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left', customMaxWidth?: number) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Clean text for ATS - remove special characters that might confuse parsers
    const cleanText = text.replace(/[^\w\s.,;:()@\-+/|•]/g, '');
    
    const effectiveMaxWidth = customMaxWidth || maxWidth;
    const lines = doc.splitTextToSize(cleanText, effectiveMaxWidth);
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      if (align === 'center') {
        doc.text(line, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(line, headerXOffset, y);
      }
      y += fontSize * 0.5;
    });
  };

  // ATS-friendly section headers (clear, standard naming)
  const addSection = (title: string) => {
    y += 5;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    headerXOffset = margin; // Reset offset for body content
    maxWidth = pageWidth - margin * 2; // Reset max width
    addText(title.toUpperCase(), 12, true);
    y += 2;
  };

  // Header - Name prominently at top (ATS best practice)
  // If photo is included, align header to left to not overlap
  const headerAlign = includePhoto && formData.photoUrl ? 'left' : 'center';
  addText(formData.fullName.toUpperCase(), 18, true, headerAlign);
  y += 2;
  addText(formData.professionalTitle, 12, false, headerAlign);
  y += 2;
  
  // Contact info on single line (ATS-friendly format)
  const contactParts = [formData.email, formData.phone, formData.location].filter(Boolean);
  addText(contactParts.join(' | '), 10, false, headerAlign);
  
  if (formData.linkedinUrl || formData.portfolioUrl) {
    const links = [formData.linkedinUrl, formData.portfolioUrl].filter(Boolean);
    addText(links.join(' | '), 9, false, headerAlign);
  }
  
  // Reset to full width after header section
  if (includePhoto && formData.photoUrl) {
    y = Math.max(y, 70); // Ensure we're below the photo
    maxWidth = pageWidth - margin * 2;
  }

  // Professional Summary (ATS keyword-rich section)
  if (formData.summary) {
    addSection('PROFESSIONAL SUMMARY');
    addText(formData.summary, 10);
  }

  // Work Experience (reverse chronological - ATS standard)
  if (formData.workExperience.length > 0) {
    addSection('WORK EXPERIENCE');
    formData.workExperience.forEach((work) => {
      addText(work.jobTitle, 11, true);
      addText(`${work.company}${work.location ? ', ' + work.location : ''}`, 10);
      addText(`${work.startDate} - ${work.isCurrentlyWorking ? 'Present' : work.endDate}`, 9);
      if (work.responsibilities) {
        // Format bullet points for ATS
        const bullets = work.responsibilities.split('\n').filter(b => b.trim());
        bullets.forEach(bullet => {
          const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '').trim();
          if (cleanBullet) addText(`• ${cleanBullet}`, 10);
        });
      }
      y += 3;
    });
  }

  // Education
  if (formData.education.length > 0) {
    addSection('EDUCATION');
    formData.education.forEach((edu) => {
      addText(edu.degree, 11, true);
      addText(`${edu.institution}${edu.location ? ', ' + edu.location : ''}`, 10);
      addText(`${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate}`, 9);
      if (edu.gpa) addText(`GPA: ${edu.gpa}`, 9);
      if (edu.coursework) addText(`Relevant Coursework: ${edu.coursework}`, 9);
      y += 3;
    });
  }

  // Skills (comma-separated list for ATS parsing)
  if (formData.skills.length > 0) {
    addSection('SKILLS');
    addText(formData.skills.join(', '), 10);
  }

  // Projects
  if (formData.projects.length > 0) {
    addSection('PROJECTS');
    formData.projects.forEach((project) => {
      addText(`${project.title}${project.role ? ' - ' + project.role : ''}`, 11, true);
      if (project.date) addText(project.date, 9);
      addText(project.description, 10);
      if (project.link) addText(`Link: ${project.link}`, 9);
      y += 3;
    });
  }

  // Custom Sections
  formData.customSections.forEach((section) => {
    addSection(section.name.toUpperCase());
    addText(section.content, 10);
  });

  // Save with clean filename
  const filename = formData.cvTitle || `${formData.fullName}_CV`;
  doc.save(`${filename.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`);
};

// ATS-optimized DOCX generation
export const generateDOCX = async (formData: CVFormData): Promise<void> => {
  const children: Paragraph[] = [];

  // Header - Name prominently displayed
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formData.fullName.toUpperCase(), bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: formData.professionalTitle, size: 24 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ 
        text: [formData.email, formData.phone, formData.location].filter(Boolean).join(' | '), 
        size: 20 
      })],
      alignment: AlignmentType.CENTER,
    })
  );

  if (formData.linkedinUrl || formData.portfolioUrl) {
    children.push(
      new Paragraph({
        children: [new TextRun({ 
          text: [formData.linkedinUrl, formData.portfolioUrl].filter(Boolean).join(' | '), 
          size: 18 
        })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Helper to add section with ATS-friendly formatting
  const addSection = (title: string) => {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
      })
    );
  };

  // Summary
  if (formData.summary) {
    addSection('PROFESSIONAL SUMMARY');
    children.push(new Paragraph({ children: [new TextRun({ text: formData.summary, size: 22 })] }));
  }

  // Work Experience (before Education for ATS - standard order)
  if (formData.workExperience.length > 0) {
    addSection('WORK EXPERIENCE');
    formData.workExperience.forEach((work) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: work.jobTitle, bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: `${work.company}${work.location ? ', ' + work.location : ''}`, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `${work.startDate} - ${work.isCurrentlyWorking ? 'Present' : work.endDate}`, size: 20 })] })
      );
      if (work.responsibilities) {
        // Parse bullet points for ATS
        const bullets = work.responsibilities.split('\n').filter(b => b.trim());
        bullets.forEach(bullet => {
          const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '').trim();
          if (cleanBullet) {
            children.push(new Paragraph({ 
              children: [new TextRun({ text: `• ${cleanBullet}`, size: 22 })],
              indent: { left: 360 }
            }));
          }
        });
      }
    });
  }

  // Education
  if (formData.education.length > 0) {
    addSection('EDUCATION');
    formData.education.forEach((edu) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: edu.degree, bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: `${edu.institution}${edu.location ? ', ' + edu.location : ''}`, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate}`, size: 20 })] })
      );
      if (edu.gpa) {
        children.push(new Paragraph({ children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20 })] }));
      }
      if (edu.coursework) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Relevant Coursework: ${edu.coursework}`, size: 20 })] }));
      }
    });
  }

  // Skills (comma-separated for ATS parsing)
  if (formData.skills.length > 0) {
    addSection('SKILLS');
    children.push(new Paragraph({ children: [new TextRun({ text: formData.skills.join(', '), size: 22 })] }));
  }

  // Projects
  if (formData.projects.length > 0) {
    addSection('PROJECTS');
    formData.projects.forEach((project) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: `${project.title}${project.role ? ' - ' + project.role : ''}`, bold: true, size: 24 })] })
      );
      if (project.date) {
        children.push(new Paragraph({ children: [new TextRun({ text: project.date, size: 20 })] }));
      }
      children.push(new Paragraph({ children: [new TextRun({ text: project.description, size: 22 })] }));
      if (project.link) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Link: ${project.link}`, size: 20 })] }));
      }
    });
  }

  // Custom Sections
  formData.customSections.forEach((section) => {
    addSection(section.name.toUpperCase());
    children.push(new Paragraph({ children: [new TextRun({ text: section.content, size: 22 })] }));
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = formData.cvTitle || `${formData.fullName}_CV`;
  saveAs(blob, `${filename.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.docx`);
};
