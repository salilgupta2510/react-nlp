import React from "react";
import BaseComponent from "./BaseComponent";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

Number.isNaN = Number.isNaN || function(value) {
  return typeof value === "number" && value !== value;
}

class LineAnalyzer extends BaseComponent {
  notifyAnalysis() {
    const { onAnalysis, lineBreak, types, annotations, colors } = this.props;
    let result = [];
    let prevXWidth = null;
    let currentLineTop = 0;
    let currentLine = 0;
    Object.keys(this.refs).filter(refId => {
      return !Number.isNaN(Number(refId));
    }).sort((a, b) => {
      a = Number(a);
      b = Number(b);
      if ( a < b ) return -1;
      if ( a > b ) return 1;
      return 0;
    }).forEach(refId => {
      const e = this.refs[refId];
      const rect = {left: e.offsetLeft, top: e.offsetTop, width: e.offsetWidth, height: e.offsetHeight};
      if (refId == 0) {
        currentLineTop = rect.top;
      }
      if (lineBreak && currentLineTop < rect.top) {
        currentLineTop = rect.top;
        currentLine++;
        prevXWidth = null;
      }
      let x = 0;
      if (prevXWidth) {
        x = prevXWidth.x + prevXWidth.width;
      }
      const res = {line: currentLine, char: e.innerHTML, x: x, width: rect.width};
      result.push(res);
      prevXWidth = res;
    });
    onAnalysis(result);
  }

  componentDidUpdate() {
    this.notifyAnalysis();
  }

  componentDidMount() {
    new ResizeSensor(this.refs.container, () => {
      this.notifyAnalysis();
    });
    this.notifyAnalysis();
  }

  render() {
    const { text, lineBreak, keepWhiteSpaces, annotations } = this.props;
    const { theme } = this.context;
    const spans = [];
    let keyIdx = 0;
    
    // todo-01: refactor
    let adj = [];
    annotations.forEach((annotation) => {
      const from = annotation[1];
      const to = annotation[2];
      const name = annotation[3];
      if ((to - from + 1) <= name.length) {
        adj.push([from, to, name.length])
      }
    });
    
    
    for (let i = 0; i < text.length; i++) {
      let spanStyles = {};
      spanStyles.paddingLeft = theme.characterPadding;
      spanStyles.paddingRight = theme.characterPadding;
      if (text[i] === " " && keepWhiteSpaces) {
        spanStyles.whiteSpace = "pre";
      }
      
      // todo-01: refactor
      for (let k = 0; k < adj.length; k++) {
        const from = adj[k][0];
        const to = adj[k][1];
        const len = adj[k][2];
        const pad = len+3;
        if (i == from) {
          spanStyles.paddingLeft = pad+"px";
        }
        if (i == to) {
          spanStyles.paddingRight = pad+"px";
        }
      }
      
      spans.push(
        <span key={i} ref={i} style={spanStyles}>{text[i]}</span>
      );
    }
    
    const containerStyles = {
      position: "absolute",
      visibility: "hidden",
      top: 0,
      left: 0,
      width: "100%"
    };
    if (lineBreak) {
      containerStyles.whiteSpace = "normal";
    } else {
      containerStyles.whiteSpace = "nowrap";
    }
    return (
      <div ref="container" style={containerStyles}>
        {spans}
      </div>
    );
  }
}

export default LineAnalyzer;
