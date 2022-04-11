import React from "react";
import { Logo } from "../img";

export function Header() {
	return (
		<header id="header" style={{ backgroundColor: "black", height: "40px", color: "white" }}>
			<div style={{ paddingLeft: "30px" }}>
				<img src={Logo} alt="Picus" style={{ height: "40px" }} />
			</div>
		</header>
	);
}
