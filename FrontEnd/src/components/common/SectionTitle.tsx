import "./SectionTitle.css";

type SectionTitleProps = {
  title: string;
  description?: string;
};

function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionTitle;