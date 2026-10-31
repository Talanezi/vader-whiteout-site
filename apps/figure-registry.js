/* Keep original declarations compatible with Hairline's build/look tools. */
window.whiteoutFigures = new Map();
window.hairline = (figure) => window.whiteoutFigures.set(figure.name, figure);
