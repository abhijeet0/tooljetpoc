/** @format */

import { Button } from "@progress/kendo-react-all";
import React from "react";

function KendoButton({ component, onClick }) {
  const { backgroundColor, borderColor, borderRadius, textColor } =
    component.definition.styles;
  const styles = {
    backgroundColor: backgroundColor.value,
    border: `1px solid  ${borderColor.value}`,
    borderRadius: parseInt(borderRadius.value.replace(/[^\d]/g, "")),
    color: textColor.value,
    boxShadow: component.definition.generalStyles.boxShadow.value,
    width: "100px",
    height: "50px",
    // width:  definition.styles.                    .value,
    // height:  definition.styles.                    .value,
    // position:  definition.styles.                    .value,
    // tooltip: definition.general.tooltip.value,
  };

  return (
    <Button id={component.name} style={styles} onClick={onClick}>
      {component.definition.properties.text.value}
    </Button>
  );
}

export default KendoButton;
