import Image from "next/image";

const icons = ["javascript", "typescript", "python", "go", "php", "react", "react", "nextjs", "tailwindcss", "nodejs", "express", "laravel", "mongodb", "postgresql", "git", "figma"];

// Icon chips that open their label on hover or keyboard focus (CSS only); phones show every label.
export function SkillList({ skills }: { skills: { name: string }[] }) {
  return <div className="skills" role="list" aria-label="Tech stack">{skills.map((skill, index) => <div role="listitem" key={skill.name}>
    <button type="button" className="skill" aria-label={skill.name}>
      <Image src={`/icons/${icons[index]}.svg`} width={22} height={22} alt="" className={["nextjs", "express"].includes(icons[index]) ? "mono-icon" : undefined} />
      <span aria-hidden="true">{skill.name}</span>
    </button>
  </div>)}</div>;
}
