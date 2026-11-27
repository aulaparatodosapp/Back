import {
  AssessmentApprovedPayload,
  CourseApprovedPayload,
  DonationReceiptPayload,
  EnrollmentConfirmationPayload,
  LoginAlertPayload,
  UserRegisterNotificationPayload,
} from '../interfaces/mail-payload.interfaces';

export function loginAlertTemplate(payload: LoginAlertPayload): string {
  return `
    <h2>Nuevo inicio de sesión</h2>
    <p>Hola ${payload.userName}, detectamos un inicio de sesión en tu cuenta.</p>
    <p>Fecha: ${new Date(payload.loginDate).toLocaleString('es-AR')}</p>
    <p>IP: ${payload.ip}</p>
    <p>Dispositivo: ${payload.userAgent}</p>
  `;
}

export function userRegisterTemplate(
  payload: UserRegisterNotificationPayload,
): string {
  return `
    <h2>¡Bienvenido/a a Aula Para Todos!</h2>
    <p>Hola ${payload.userName}, tu cuenta fue creada con éxito.</p>
    <p><a href="${payload.loginUrl}">Iniciar sesión</a></p>
    <p><a href="${payload.coursesCatalogUrl}">Ver catálogo de cursos</a></p>
  `;
}

export function donationReceiptTemplate(
  payload: DonationReceiptPayload,
): string {
  return `
    <h2>¡Gracias por tu donación!</h2>
    <p>Hola ${payload.donorName}, recibimos tu donación.</p>
    <p>Monto: $${payload.amount}</p>
    <p>Fecha: ${new Date(payload.dateDonor).toLocaleString('es-AR')}</p>
    <p>ID de pago: ${payload.paymentId}</p>
  `;
}

export function enrollmentConfirmationTemplate(
  payload: EnrollmentConfirmationPayload,
): string {
  return `
    <h2>Inscripción confirmada</h2>
    <p>Hola ${payload.userName}, te inscribiste en el curso "${payload.courseTitle}".</p>
    <p>Fecha de inscripción: ${new Date(payload.enrollmentDate).toLocaleString('es-AR')}</p>
    <p><a href="${payload.courseUrl}">Ir al curso</a></p>
  `;
}

export function assessmentApprovedTemplate(
  payload: AssessmentApprovedPayload,
): string {
  return `
    <h2>¡Evaluación aprobada!</h2>
    <p>Felicitaciones ${payload.studentName}, aprobaste "${payload.assessmentTitle}" del curso "${payload.courseTitle}".</p>
    <p>Puntaje: ${payload.score} / ${payload.maxScore}</p>
    <p><a href="${payload.nextStepUrl}">Continuar</a></p>
  `;
}

export function courseApprovedTemplate(payload: CourseApprovedPayload): string {
  return `
    <h2>¡Curso aprobado!</h2>
    <p>Felicitaciones ${payload.studentName}, completaste el curso "${payload.courseTitle}".</p>
    <p>Fecha de finalización: ${new Date(payload.completionDate).toLocaleString('es-AR')}</p>
    ${payload.finalScore !== undefined ? `<p>Nota final: ${payload.finalScore}</p>` : ''}
    ${payload.certificateUrl ? `<p><a href="${payload.certificateUrl}">Ver certificado</a></p>` : ''}
  `;
}
