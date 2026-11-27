export interface LoginAlertPayload {
    userName: string; 
    ip: string;
    userAgent: string
    loginDate: Date;
} 

export interface UserRegisterNotificationPayload {
userName: string;
loginUrl: string;           // permite poner un botón directo "Singin"
coursesCatalogUrl: string;  // permite poner un botón directo "Ver catalogo de cursos"

}

export interface DonationReceiptPayload {
donorName: string;
amount: number;
dateDonor: Date;
paymentId: string;
}

export interface EnrollmentConfirmationPayload {
courseTitle: string;
userName: string;
enrollmentDate: Date;
courseUrl: string;       // permite poner un botón directo "Ir al curso"

}

export interface AssessmentApprovedPayload {
  studentName: string;
  courseTitle: string;
  assessmentTitle: string; 
  score: number;           
  maxScore: number;       
  nextStepUrl: string;     
}

export interface CourseApprovedPayload {
  studentName: string;
  courseTitle: string;
  completionDate: Date;  
  finalScore?: number;     
  certificateUrl?: string; 
  
}