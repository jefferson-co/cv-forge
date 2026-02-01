import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { CVFormData } from '@/types/cv';

export const generatePDF = (formData: CVFormData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      if (align === 'center') {
        doc.text(line, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(line, margin, y);
      }
      y += fontSize * 0.5;
    });
  };

  const addSection = (title: string) => {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    addText(title, 12, true);
    y += 2;
  };

  // Header
  addText(formData.fullName, 18, true, 'center');
  y += 2;
  addText(formData.professionalTitle, 12, false, 'center');
  y += 2;
  
  const contactInfo = [formData.email, formData.phone, formData.location].filter(Boolean).join(' | ');
  addText(contactInfo, 10, false, 'center');
  
  if (formData.linkedinUrl || formData.portfolioUrl) {
    const links = [formData.linkedinUrl, formData.portfolioUrl].filter(Boolean).join(' | ');
    addText(links, 9, false, 'center');
  }

  // Summary
  if (formData.summary) {
    addSection('PROFESSIONAL SUMMARY');
    addText(formData.summary, 10);
  }

  // Education
  if (formData.education.length > 0) {
    addSection('EDUCATION');
    formData.education.forEach((edu) => {
      addText(`${edu.degree}`, 11, true);
      addText(`${edu.institution}${edu.location ? `, ${edu.location}` : ''}`, 10);
      addText(`${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate}`, 9);
      if (edu.gpa) addText(`GPA: ${edu.gpa}`, 9);
      if (edu.coursework) addText(`Coursework: ${edu.coursework}`, 9);
      y += 3;
    });
  }

  // Work Experience
  if (formData.workExperience.length > 0) {
    addSection('WORK EXPERIENCE');
    formData.workExperience.forEach((work) => {
      addText(`${work.jobTitle}`, 11, true);
      addText(`${work.company}${work.location ? `, ${work.location}` : ''}`, 10);
      addText(`${work.startDate} - ${work.isCurrentlyWorking ? 'Present' : work.endDate}`, 9);
      if (work.responsibilities) {
        addText(work.responsibilities, 10);
      }
      y += 3;
    });
  }

  // Skills
  if (formData.skills.length > 0) {
    addSection('SKILLS');
    addText(formData.skills.join(' • '), 10);
  }

  // Projects
  if (formData.projects.length > 0) {
    addSection('PROJECTS');
    formData.projects.forEach((project) => {
      addText(`${project.title}${project.role ? ` - ${project.role}` : ''}`, 11, true);
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

  // Save
  doc.save(`${formData.fullName.replace(/\s+/g, '_')}_CV.pdf`);
};

export const generateDOCX = async (formData: CVFormData): Promise<void> => {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formData.fullName, bold: true, size: 36 })],
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

  // Helper to add section
  const addSection = (title: string) => {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
      })
    );
  };

  // Summary
  if (formData.summary) {
    addSection('PROFESSIONAL SUMMARY');
    children.push(new Paragraph({ children: [new TextRun({ text: formData.summary, size: 22 })] }));
  }

  // Education
  if (formData.education.length > 0) {
    addSection('EDUCATION');
    formData.education.forEach((edu) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: edu.degree, bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: `${edu.institution}${edu.location ? `, ${edu.location}` : ''}`, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate}`, size: 20 })] })
      );
      if (edu.gpa) {
        children.push(new Paragraph({ children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20 })] }));
      }
      if (edu.coursework) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Coursework: ${edu.coursework}`, size: 20 })] }));
      }
    });
  }

  // Work Experience
  if (formData.workExperience.length > 0) {
    addSection('WORK EXPERIENCE');
    formData.workExperience.forEach((work) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: work.jobTitle, bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: `${work.company}${work.location ? `, ${work.location}` : ''}`, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: `${work.startDate} - ${work.isCurrentlyWorking ? 'Present' : work.endDate}`, size: 20 })] })
      );
      if (work.responsibilities) {
        children.push(new Paragraph({ children: [new TextRun({ text: work.responsibilities, size: 22 })] }));
      }
    });
  }

  // Skills
  if (formData.skills.length > 0) {
    addSection('SKILLS');
    children.push(new Paragraph({ children: [new TextRun({ text: formData.skills.join(' • '), size: 22 })] }));
  }

  // Projects
  if (formData.projects.length > 0) {
    addSection('PROJECTS');
    formData.projects.forEach((project) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: `${project.title}${project.role ? ` - ${project.role}` : ''}`, bold: true, size: 24 })] })
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
  saveAs(blob, `${formData.fullName.replace(/\s+/g, '_')}_CV.docx`);
};
