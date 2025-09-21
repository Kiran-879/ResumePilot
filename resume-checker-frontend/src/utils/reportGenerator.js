// src/utils/reportGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateEvaluationReport = (evaluation) => {
  console.log('generateEvaluationReport called with:', evaluation);
  
  try {
    const doc = new jsPDF();
    console.log('jsPDF initialized');
    
    // Simple test first
    doc.setFontSize(20);
    doc.text('Resume Evaluation Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Evaluation ID: ' + (evaluation?.id || 'N/A'), 20, 40);
    
    // Get candidate name safely
    const candidateName = evaluation?.resume_details?.personal_info?.name || 
                         evaluation?.resume_details?.user?.username || 
                         'Unknown Candidate';
    doc.text('Candidate: ' + candidateName, 20, 60);
    
    // Get job info safely  
    const jobTitle = evaluation?.job_details?.title || 
                    evaluation?.job_description?.title || 
                    'Unknown Position';
    doc.text('Position: ' + jobTitle, 20, 80);
    
    // Add overall score
    const overallScore = evaluation?.overall_score || 0;
    doc.text('Overall Score: ' + overallScore + '%', 20, 100);
    
    console.log('Basic info added to PDF');
    
    // Generate filename
    const sanitizedName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedJob = jobTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_${sanitizedJob}_Report.pdf`;
    
    console.log('Generated filename:', filename);
    
    // Save the PDF
    doc.save(filename);
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

export default generateEvaluationReport;