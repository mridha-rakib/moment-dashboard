import moomentIcon from "../assets/image/mooment-icon.png";

// Standalone gradient brand mark. Full color — never apply a CSS filter/tint
// to it, that would flatten the gradient to a flat color.
export default function Logo({ className = "w-11 h-11", alt = "mooment logo" }) {
  return <img src={moomentIcon} alt={alt} className={`object-contain ${className}`} />;
}
