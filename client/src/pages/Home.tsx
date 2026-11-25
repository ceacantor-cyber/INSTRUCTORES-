import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, CheckCircle2, ChevronRight, CircleDot, FileImage, Gauge, MessageSquare, ShieldCheck, Star, Upload, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const criteria = [
  { key: "presentationPersonal", label: "Presentación personal", help: "Imagen profesional y adecuada." },
  { key: "teachingExperience", label: "Experiencia de enseñanza", help: "Dominio y claridad al enseñar." },
  { key: "respectfulAttention", label: "Atención respetuosa", help: "Trato amable, paciente y respetuoso." },
  { key: "explanationClarity", label: "Claridad de las explicaciones", help: "Indicaciones fáciles de entender." },
  { key: "punctualitySafety", label: "Puntualidad y seguridad", help: "Cumplimiento de horarios y conducción segura." },
] as const;
type CriteriaKey = (typeof criteria)[number]["key"];
type CriteriaState = Record<CriteriaKey, number>;
const emptyCriteria: CriteriaState = { presentationPersonal: 0, teachingExperience: 0, respectfulAttention: 0, explanationClarity: 0, punctualitySafety: 0 };

function BrandMark() { return <div className="brand-mark" aria-hidden="true"><span>CC</span><i /></div>; }

function StarPicker({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
  return <div className={compact ? "star-picker compact" : "star-picker"} role="radiogroup" aria-label="Calificación de 1 a 5 estrellas">
    {[1, 2, 3, 4, 5].map(rating => <button key={rating} type="button" className={rating <= value ? "star-button active" : "star-button"} onClick={() => onChange(rating)} role="radio" aria-checked={rating === value} aria-label={`${rating} ${rating === 1 ? "estrella" : "estrellas"}`}><Star fill="currentColor" /></button>)}
  </div>;
}

export default function Home() {
  const instructorsQuery = trpc.evaluation.instructors.useQuery();
  const [instructorId, setInstructorId] = useState("");
  const [rating, setRating] = useState(0);
  const [criteriaState, setCriteriaState] = useState<CriteriaState>(emptyCriteria);
  const [feedback, setFeedback] = useState("");
  const [photoData, setPhotoData] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.evaluation.submit.useMutation({
    onSuccess: () => { setSubmitted(true); setRating(0); setCriteriaState(emptyCriteria); setInstructorId(""); setFeedback(""); setPhotoData(""); setPhotoName(""); toast.success("Tu evaluación quedó registrada"); },
    onError: () => toast.error("No pudimos registrar tu evaluación. Intenta de nuevo."),
  });
  const instructors = instructorsQuery.data ?? [];
  const a2 = instructors.filter(item => item.category === "A2");
  const b2c2 = instructors.filter(item => item.category === "B2-C2");
  const criteriaComplete = criteria.every(item => criteriaState[item.key] > 0);

  const handlePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecciona una imagen válida."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("La foto debe pesar menos de 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhotoData(String(reader.result)); setPhotoName(file.name); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!instructorId || rating === 0 || !criteriaComplete) { toast.error("Completa el instructor, la calificación general y todos los criterios."); return; }
    submitMutation.mutate({ instructorId: Number(instructorId), rating, ...criteriaState, feedback: feedback.trim() || undefined, photoData: photoData || undefined });
  };

  return <main className="site-shell public-shell">
    <header className="topbar container-wide"><a className="brand" href="/" aria-label="CEA Cantor, inicio"><BrandMark /><span className="brand-copy"><strong>CEA CANTOR</strong><small>Escuela de conducción</small></span></a><Link className="topbar-link" href="/operador">Consola operador <ArrowUpRight size={15} /></Link></header>
    <section className="hero container-wide"><div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> Voz del estudiante · 01</div><h1>Tu experiencia<br /><em>hace la diferencia.</em></h1><p className="hero-lede">Ayúdanos a mejorar cada kilómetro. Evalúa a tu instructor de forma confidencial y ayúdanos a mantener la calidad de CEA Cantor.</p><div className="hero-points"><div><Gauge size={18} /><span><b>02 min</b><small>Evaluación completa</small></span></div><div><ShieldCheck size={18} /><span><b>Confidencial</b><small>Sin datos personales</small></span></div></div></div><div className="route-card"><div className="route-card-top"><span>CEA / CALIDAD</span><CircleDot size={17} /></div><div className="route-line"><span className="route-node active" /><span className="route-dash" /><span className="route-node" /><span className="route-dash" /><span className="route-node" /></div><div className="route-card-copy"><b>Cada detalle cuenta<br />para conducir mejor.</b><span>Tu reporte llega al equipo académico.</span></div><div className="route-card-footer"><span>RUTA 05 / FEEDBACK</span><ChevronRight size={16} /></div></div></section>
    <section className="form-section container-wide" id="evaluar"><div className="section-heading"><div><div className="eyebrow">Evaluación de calidad</div><h2>Cuéntanos cómo fue tu experiencia.</h2></div><span className="section-index">02 <i>/</i> 03</span></div><div className="form-layout"><form className="evaluation-card" onSubmit={handleSubmit}>
      {submitted ? <div className="success-state"><div className="success-icon"><CheckCircle2 size={32} /></div><div><div className="eyebrow">Registro completado</div><h3>Gracias por ayudarnos a mejorar.</h3><p>Tu opinión ya está en nuestro tablero de calidad.</p></div><Button type="button" variant="outline" onClick={() => setSubmitted(false)}>Registrar otra opinión</Button></div> : <>
        <div className="form-step"><span>01</span><div><label htmlFor="instructor">¿A quién quieres evaluar?</label><p>Selecciona la categoría y el instructor que te acompañó.</p></div></div>
        <select id="instructor" value={instructorId} onChange={event => setInstructorId(event.target.value)} className="field-control" disabled={instructorsQuery.isLoading}><option value="">{instructorsQuery.isLoading ? "Cargando instructores…" : "Selecciona un instructor"}</option><optgroup label="Categoría A2 · Motocicletas">{a2.map(instructor => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}</optgroup><optgroup label="Categorías B2-C2 · Vehículos">{b2c2.map(instructor => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}</optgroup></select>
        <div className="form-step rating-step"><span>02</span><div><label>Calificación general</label><p>¿Qué tan satisfecho quedaste con tu instructor?</p></div></div><StarPicker value={rating} onChange={setRating} /><div className="rating-caption"><span>{rating === 0 ? "Selecciona una calificación" : ["Necesita mejorar", "Puede mejorar", "Bien", "Muy bien", "Excelente"][rating - 1]}</span><span>{rating > 0 ? `${rating}/5` : "—"}</span></div>
        <div className="form-step criteria-heading"><span>03</span><div><label>Evalúa estos aspectos</label><p>Marca de 1 a 5 estrellas en cada criterio.</p></div></div><div className="criteria-list">{criteria.map(item => <div className="criterion-row" key={item.key}><div><strong>{item.label}</strong><small>{item.help}</small></div><StarPicker compact value={criteriaState[item.key]} onChange={value => setCriteriaState(current => ({ ...current, [item.key]: value }))} /></div>)}</div>
        <div className="form-step comment-step"><span>04</span><div><label htmlFor="feedback">Observaciones o reporte <small>Opcional</small></label><p>Cuéntanos qué podemos reconocer o mejorar.</p></div></div><textarea id="feedback" value={feedback} maxLength={1200} onChange={event => setFeedback(event.target.value)} className="field-control textarea-control" placeholder="Escribe aquí tus observaciones…" rows={4} />
        <div className="photo-upload"><div><strong><FileImage size={17} /> ¿Quieres anexar una foto?</strong><small>Opcional · Úsala para reportar una situación concreta. Máximo 2 MB.</small></div><label className="upload-button"><Upload size={15} /> {photoName ? "Cambiar foto" : "Adjuntar foto"}<input type="file" accept="image/*" onChange={event => handlePhoto(event.target.files?.[0])} /></label>{photoData && <div className="photo-preview"><img src={photoData} alt="Vista previa del reporte" /><button type="button" onClick={() => { setPhotoData(""); setPhotoName(""); }} aria-label="Quitar foto"><X size={14} /></button></div>}</div>
        <div className="submit-row"><span><ShieldCheck size={15} /> Tu respuesta es confidencial</span><Button type="submit" size="lg" disabled={submitMutation.isPending}>{submitMutation.isPending ? "Enviando…" : "Enviar evaluación"}<ArrowUpRight size={17} /></Button></div>
      </>}
    </form><aside className="side-note"><div className="side-note-number">03</div><MessageSquare size={22} /><h3>Lo que nos cuentas<br /><em>mueve la escuela.</em></h3><p>Usamos tus respuestas para reconocer buenas prácticas y atender oportunamente cualquier reporte.</p><div className="side-note-line" /><span>Gracias por ser parte del camino.</span></aside></div></section>
    <footer className="footer container-wide"><span>© {new Date().getFullYear()} CEA Cantor</span><span>Conducción segura · Aprendizaje constante</span><Link href="/operador">Acceso de operador</Link></footer>
  </main>;
}
