import Image from "next/image";
import cornerCircleSvg from "@/public/corner-circle.svg";
import "./style.css";

/**
 * The pale rounded SVG shape in the top-right corner of every page. Rendered once
 * from the (root) layout — pages must not add their own.
 */
const CornerDecoration = () => {
  return (
    <div className="corner-decoration" aria-hidden="true">
      <Image src={cornerCircleSvg} alt="" priority className="corner-decoration-img" />
    </div>
  );
};

export default CornerDecoration;
