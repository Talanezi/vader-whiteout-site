import{r as K,j as Ne}from"./index-CB329wYq.js";function Ho(e){let t=e.replace("#","");(t.length===3||t.length===4)&&(t=t.split("").map(n=>n+n).join(""));const o=t.length>=8?parseInt(t.slice(6,8),16)/255:1;return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255,o]}function _a(e,t,o){e/=255,t/=255,o/=255;const n=Math.max(e,t,o),a=Math.min(e,t,o),i=n-a;let r=0;const l=n===0?0:i/n;return i!==0&&(n===e?r=((t-o)/i+6)%6:n===t?r=(o-e)/i+2:r=(e-t)/i+4,r/=6),[r,l,n]}function Ra(e,t,o){const n=Math.floor(e*6),a=e*6-n,i=o*(1-t),r=o*(1-a*t),l=o*(1-(1-a)*t);let s=0,c=0,u=0;switch(n%6){case 0:s=o,c=l,u=i;break;case 1:s=r,c=o,u=i;break;case 2:s=i,c=o,u=l;break;case 3:s=i,c=r,u=o;break;case 4:s=l,c=i,u=o;break;case 5:s=o,c=i,u=r;break}return[Math.round(s*255),Math.round(c*255),Math.round(u*255)]}const sn=66,ln=66,cn=1500,un=1,$o=16,dn=96,hn=2,fn=0,mn=1,ft={colorBack:"#00000000",speed:1,repetition:1.5,softness:.05,shiftRed:.3,shiftBlue:.3,distortion:.1,contour:.4,angle:90,shape:fn,scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,fit:mn},pn={name:"chromatic",modes:{dark:{...ft,colorTint:"#88ccff2e",shiftRed:.75,shiftBlue:.75,repetition:2,softness:.09,shaderOpacity:1},light:{...ft,colorTint:"#66b0ff99",shiftRed:.6,shiftBlue:.6,shaderOpacity:1}}},gn={name:"silver",modes:{dark:{...ft,colorTint:"#ffffff66",shaderOpacity:.88},light:{...ft,colorTint:"#ffffff40",shaderOpacity:1}}},xn={name:"gold",modes:{dark:{...ft,colorTint:"#ffcc55cc",speed:.85,shaderOpacity:.92},light:{...ft,colorTint:"#f7d488aa",shaderOpacity:1}}},Ca={chromatic:pn,silver:gn,gold:xn},vn=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,bn=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,wn=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,yn=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,Mn=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${vn}
${bn}
${yn}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${wn}

  fragColor = vec4(color, opacity);
}
`,_n=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,Rn=Mn;function Xo(e,t,o){const n=e.createShader(t);if(!n)throw new Error("metal-fx: gl.createShader returned null");if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const a=e.getShaderInfoLog(n);throw e.deleteShader(n),new Error(`metal-fx: shader compile failed: ${a??"(no info log)"}`)}return n}function Cn(e,t,o){const n=e.createProgram();if(!n)throw new Error("metal-fx: gl.createProgram returned null");if(e.attachShader(n,t),e.attachShader(n,o),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){const a=e.getProgramInfoLog(n);throw e.deleteProgram(n),new Error(`metal-fx: program link failed: ${a??"(no info log)"}`)}return n}const Sa=140,ka=40,Ta=1.6,Ea=1.3;let x=null,nt=null;function Sn(){var e;if(nt!==null)return nt;if(typeof document>"u")return nt=!1;try{const t=document.createElement("canvas").getContext("webgl2");nt=!!t,(e=t==null?void 0:t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{nt=!1}return nt}let co=null;function kn(e){co=e}const Tn=["u_resolution","u_time","u_pixelRatio","u_colorBack","u_colorTint","u_repetition","u_softness","u_shiftRed","u_shiftBlue","u_distortion","u_contour","u_angle","u_shape","u_isImage","u_image","u_originX","u_originY","u_worldWidth","u_worldHeight","u_fit","u_scale","u_rotation","u_offsetX","u_offsetY","u_imageAspectRatio"];function Yo(e){e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);const t=Xo(e,e.VERTEX_SHADER,_n),o=Xo(e,e.FRAGMENT_SHADER,Rn),n=Cn(e,t,o);e.useProgram(n);const a=e.createBuffer();if(!a)throw new Error("metal-fx: gl.createBuffer returned null");e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const i=e.getAttribLocation(n,"a_position");e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);const r={};for(const s of Tn)r[s]=e.getUniformLocation(n,s);const l=e.createTexture();return l&&(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,l),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r.u_image&&e.uniform1i(r.u_image,0)),{program:n,buffer:a,uniforms:r,dummyTexture:l}}function Aa(){if(x)return x;const e=Math.min(hn,typeof window<"u"&&window.devicePixelRatio||1),t=Math.round(dn*e),o=typeof OffscreenCanvas<"u";let n,a;if(o)n=new OffscreenCanvas(t,t),a=n.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});else{const d=document.createElement("canvas");d.width=t,d.height=t,a=d.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,preserveDrawingBuffer:!0}),n=d}if(!a)throw new Error("metal-fx: WebGL2 not supported");const{program:i,buffer:r,uniforms:l,dummyTexture:s}=Yo(a),c=d=>{d.preventDefault(),x&&(x.contextLost=!0)},u=()=>{if(!x)return;const d=Yo(x.gl);x.program=d.program,x.buffer=d.buffer,x.uniforms=d.uniforms,x.dummyTexture=d.dummyTexture,x.presetDirty=!0,x.contextLost=!1,co==null||co()};return n.addEventListener("webglcontextlost",c,!1),n.addEventListener("webglcontextrestored",u,!1),x={glCanvas:n,gl:a,program:i,buffer:r,uniforms:l,dummyTexture:s,preset:Ca.chromatic.modes.dark,presetDirty:!0,contextLost:!1,useOffscreen:o,frameBitmap:null,startMs:performance.now(),pausedMs:0,pausedAtMs:null,rafId:0,dpr:e,instances:new Set,frameCount:0,glowQueue:[],glowIdx:0,glowSkip:0,glowPixels:new Uint8Array(t*t*4),glowPixelsW:t,glowPixelsH:t},x}function En(){var e;if(!x)return;const{gl:t,program:o,buffer:n,frameBitmap:a,dummyTexture:i}=x;try{a==null||a.close(),t.deleteBuffer(n),t.deleteProgram(o),i&&t.deleteTexture(i),(e=t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{}x=null}let qo=0;function An(){if(!x)return;const e=performance.now();if(e-qo<cn)return;qo=e;const{gl:t,glCanvas:o}=x,n=o.width,a=o.height;(x.glowPixelsW!==n||x.glowPixelsH!==a)&&(x.glowPixelsW=n,x.glowPixelsH=a,x.glowPixels=new Uint8Array(n*a*4)),t.readPixels(0,0,n,a,t.RGBA,t.UNSIGNED_BYTE,x.glowPixels)}const rt={bx:0,by:0};function ko(e,t,o){if(!x)return rt.bx=0,rt.by=0,rt;const{glCanvas:n}=x,a=n.width,i=n.height,r=e.dpr,l=e.cssWidth*r,s=e.cssHeight*r,c=Sa*r,u=ka*r;let d=l*(a/c)/e.shaderScale,h=s*(i/u)/e.shaderScale;d>a&&(d=a),h>i&&(h=i);const g=(a-d)/2,p=(i-h)/2,f=g+t/e.cssWidth*d,y=p+o/e.cssHeight*h;return rt.bx=Math.round(f),rt.by=Math.round(i-1-y),rt}const Me={r:0,g:0,b:0,lum:0,count:0};function Ba(e,t,o,n,a,i){const r=Math.max(1,i|0),l=Math.max(0,n-r),s=Math.min(t,n+r+1),c=Math.max(0,a-r),u=Math.min(o,a+r+1);Me.r=0,Me.g=0,Me.b=0,Me.lum=0,Me.count=0;for(let d=c;d<u;d++){const h=d*t;for(let g=l;g<s;g++){const p=(h+g)*4;Me.r+=e[p],Me.g+=e[p+1],Me.b+=e[p+2],Me.lum+=(.2126*e[p]+.7152*e[p+1]+.0722*e[p+2])/255,Me.count++}}return Me}const ae={r:255,g:255,b:255};function uo(e,t,o,n){if(!x)return 0;const a=ko(e,t,o),i=Ba(x.glowPixels,x.glowPixelsW,x.glowPixelsH,a.bx,a.by,n);return i.count>0?i.lum/i.count:0}function Oa(e,t,o,n){if(!x)return ae.r=255,ae.g=255,ae.b=255,ae;const a=ko(e,t,o),i=Ba(x.glowPixels,x.glowPixelsW,x.glowPixelsH,a.bx,a.by,n);return i.count===0?(ae.r=255,ae.g=255,ae.b=255,ae):(ae.r=i.r/i.count,ae.g=i.g/i.count,ae.b=i.b/i.count,ae)}function Bn(e,t,o,n){if(!x)return ae.r=255,ae.g=255,ae.b=255,ae;const a=ko(e,t,o),{glowPixels:i,glowPixelsW:r,glowPixelsH:l}=x,s=Math.max(1,n|0),c=Math.max(0,a.bx-s),u=Math.min(r,a.bx+s+1),d=Math.max(0,a.by-s),h=Math.min(l,a.by+s+1);let g=-1;ae.r=255,ae.g=255,ae.b=255;for(let p=d;p<h;p++){const f=p*r;for(let y=c;y<u;y++){const w=(f+y)*4,b=i[w],m=i[w+1],M=i[w+2],v=Math.max(b,m,M),O=Math.min(b,m,M),V=(v>0?(v-O)/v:0)*(.35+.65*(v/255));V>g&&(g=V,ae.r=b,ae.g=m,ae.b=M)}}return ae}const Kt=14,jo=1.5,Zt={x:0,y:0};function mt(e=512){return{xy:new Float32Array(e*2),n:0}}function pt(e,t,o,n,a,i,r=mt()){a=Math.max(0,Math.min(a,Math.min(o,n)/2));const l=4*(Kt+1)+Math.ceil(2*(o+n)/jo)+8;r.xy.length<l*2&&(r.xy=new Float32Array(l*2));const s=r.xy;let c=0;const u=(g,p)=>{i?(i(g,p,Zt),s[c*2]=Zt.x,s[c*2+1]=Zt.y):(s[c*2]=g,s[c*2+1]=p),c++},d=(g,p,f,y)=>{const w=Math.hypot(f-g,y-p),b=Math.max(1,Math.ceil(w/jo));for(let m=0;m<b;m++){const M=m/b;u(g+(f-g)*M,p+(y-p)*M)}},h=(g,p,f,y)=>{for(let w=0;w<=Kt;w++){const b=f+(y-f)*(w/Kt);u(g+a*Math.cos(b),p+a*Math.sin(b))}};return d(e+a,t,e+o-a,t),h(e+o-a,t+a,-Math.PI/2,0),d(e+o,t+a,e+o,t+n-a),h(e+o-a,t+n-a,0,Math.PI/2),d(e+o-a,t+n,e+a,t+n),h(e+a,t+n-a,Math.PI/2,Math.PI),d(e,t+n-a,e,t+a),h(e+a,t+a,Math.PI,1.5*Math.PI),r.n=c,r}kn(()=>{x&&x.instances.size>0&&x.pausedAtMs===null&&Tt()});typeof document<"u"&&document.addEventListener("visibilitychange",()=>{!x||x.pausedAtMs!==null||x.contextLost||(document.hidden?La():x.instances.size>0&&Tt())});function On(e){const t=Aa(),o=e.hostCanvas.getContext("2d",{alpha:!0});if(!o)throw new Error("metal-fx: canvas 2D context unavailable");const n=e.scale??1,a={canvas:e.hostCanvas,ctx:o,cssWidth:e.cssWidth,cssHeight:e.cssHeight,cornerRadius:e.cornerRadius,kind:e.kind,ringCssPx:e.ringCssPx??(e.kind==="circle"?2:1)*n,shaderScale:e.shaderScale??(e.kind==="circle"?Ea:Ta)*n,opacityMul:e.opacityMul??1,glowGain:e.glowGain??1,visible:!0,paused:e.paused??!1,everCopied:!1,frozen:null,dpr:typeof window<"u"&&window.devicePixelRatio||1,scale:n,onAfterFrame:e.onAfterFrame,onComposite:e.onComposite,onFirstCopy:e.onFirstCopy,mask:e.mask??null,deform:null,deformLayers:null,overscan:0,cursorLight:null,glowFast:!1,rawCanvas:null,wantRaw:!1,ringCanvas:null,wantRing:!1};return Wt(a),t.instances.add(a),t.rafId===0&&t.pausedAtMs===null&&Tt(),a}function In(e){if(!x)return;x.instances.delete(e);const t=x.glowQueue.indexOf(e);t!==-1&&x.glowQueue.splice(t,1),x.instances.size===0&&(La(),En())}function Fn(e){x&&(x.glowQueue.includes(e)||x.glowQueue.push(e))}function Pn(e){if(!x)return;const t=x.glowQueue.indexOf(e);t!==-1&&x.glowQueue.splice(t,1)}function it(e,t){let o=!1;t.mask!==void 0&&(e.mask=t.mask),t.cssWidth!==void 0&&t.cssWidth!==e.cssWidth&&(e.cssWidth=t.cssWidth,o=!0),t.cssHeight!==void 0&&t.cssHeight!==e.cssHeight&&(e.cssHeight=t.cssHeight,o=!0),t.cornerRadius!==void 0&&(e.cornerRadius=t.cornerRadius),t.scale!==void 0&&(e.scale=t.scale),t.kind!==void 0&&t.kind!==e.kind&&(e.kind=t.kind,t.shaderScale===void 0&&(e.shaderScale=(t.kind==="circle"?Ea:Ta)*e.scale),t.ringCssPx===void 0&&(e.ringCssPx=(t.kind==="circle"?2:1)*e.scale)),t.shaderScale!==void 0&&(e.shaderScale=t.shaderScale),t.ringCssPx!==void 0&&(e.ringCssPx=t.ringCssPx),t.opacityMul!==void 0&&(e.opacityMul=t.opacityMul),t.glowGain!==void 0&&(e.glowGain=t.glowGain),t.paused!==void 0&&t.paused!==e.paused&&(e.paused=t.paused,t.paused?Fa(e):e.frozen=null,!t.paused&&x&&x.rafId===0&&x.pausedAtMs===null&&!x.contextLost&&Tt()),o&&Wt(e)}function Ln(e,t){e.visible=t,t&&x&&x.rafId===0&&x.pausedAtMs===null&&!x.contextLost&&Tt()}function Qo(e,t,o=null,n=0){const a=Ia(e);if(!a)return!1;a.deform=t,a.deformLayers=t?o:null;const i=t?Math.max(0,Math.round(n)):0;return i!==a.overscan&&(a.overscan=i,Wt(a)),Gt(a),!0}function Un(e){return(typeof window<"u"&&window.devicePixelRatio||1)===e.dpr?!1:(Wt(e),Gt(e),!0)}function Nn(e){const t=Ia(e);t&&Gt(t)}function Ia(e){if(!x)return null;for(const t of x.instances)if(t.canvas===e)return t;return null}function zn(e,t){const o=Aa();o.preset=Ca[e].modes[t],o.presetDirty=!0}let qe=null;function Vn(e){qe=e}function eo(e,t){!qe||!x||!e.visible||e.paused||x.glowQueue.includes(e)&&(e.glowFast=!!qe(e,t))}function Wt(e){e.dpr=typeof window<"u"&&window.devicePixelRatio||1;const t=e.overscan,o=Math.max(1,Math.round((e.cssWidth+2*t)*e.dpr)),n=Math.max(1,Math.round((e.cssHeight+2*t)*e.dpr));e.canvas.width!==o&&(e.canvas.width=o),e.canvas.height!==n&&(e.canvas.height=n);const a=e.canvas.style;t>0?(a.left=`${-t}px`,a.top=`${-t}px`,a.width=`calc(100% + ${2*t}px)`,a.height=`calc(100% + ${2*t}px)`,a.borderRadius="0"):a.left!==""&&(a.left="",a.top="",a.width="100%",a.height="100%",a.borderRadius="")}function Dn(e){const{ctx:t,dpr:o,canvas:n}=e,a=e.ringCssPx*o,i=n.width,r=n.height,l=Math.max(0,(e.cornerRadius-e.ringCssPx)*o);t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.beginPath(),t.roundRect(a,a,i-2*a,r-2*a,l),t.fill(),t.restore()}const Wn=mt();function Xe(e,t,o,n,a,i,r,l){const{xy:s,n:c}=pt(t,o,n,a,i,r,Wn);e.beginPath();for(let u=0;u<c;u++)u===0?e.moveTo(s[0]*l,s[1]*l):e.lineTo(s[u*2]*l,s[u*2+1]*l);e.closePath()}function Fa(e){if(!x)return null;const t=x.frameBitmap??x.glCanvas,o=x.glCanvas.width,n=x.glCanvas.height;if(o<1||n<1)return null;let a=e.frozen;a||(a=document.createElement("canvas"),e.frozen=a),(a.width!==o||a.height!==n)&&(a.width=o,a.height=n);const i=a.getContext("2d");return i?(i.clearRect(0,0,o,n),i.drawImage(t,0,0),a):(e.frozen=null,null)}function Gt(e){var t,o;if(!x)return;const n=(e.paused?e.frozen??Fa(e):null)??x.frameBitmap??x.glCanvas,a=e.dpr,i=e.canvas.width,r=e.canvas.height;if(i<1||r<1)return;const l=Math.max(1,Math.round(e.cssWidth*a)),s=Math.max(1,Math.round(e.cssHeight*a)),c=e.overscan*a,u=n.width,d=n.height,h=Sa*a,g=ka*a;let p=l*(u/h)/e.shaderScale,f=s*(d/g)/e.shaderScale;p>u&&(p=u),f>d&&(f=d);const y=Math.max(0,(u-p)/2),w=Math.max(0,(d-f)/2),b=e.opacityMul*x.preset.shaderOpacity,m=e.ctx;m.clearRect(0,0,i,r);const M=e.deform;if(e.mask){if(b<1&&(m.globalAlpha=b),m.drawImage(n,y,w,p,f,0,0,i,r),b<1&&(m.globalAlpha=1),e.wantRaw){let v=e.rawCanvas;v||(v=document.createElement("canvas"),e.rawCanvas=v),(v.width!==i||v.height!==r)&&(v.width=i,v.height=r);const O=v.getContext("2d");O&&(O.clearRect(0,0,i,r),O.drawImage(e.canvas,0,0))}m.save(),m.globalCompositeOperation="destination-in",m.fillStyle="#000",e.mask(m,i,r,a),m.restore(),m.globalCompositeOperation="source-over"}else if(!M)b<1&&(m.globalAlpha=b),m.drawImage(n,y,w,p,f,0,0,i,r),b<1&&(m.globalAlpha=1),Dn(e);else{const v=e.cssWidth,O=e.cssHeight,V=e.cornerRadius,F=e.ringCssPx,I=e.deformLayers;m.save(),m.translate(c,c);const Q=l/p,L=s/f,N=Math.min(u,p*(l+2*c)/l),C=Math.min(d,f*(s+2*c)/s),G=Math.max(0,(u-N)/2),q=Math.max(0,(d-C)/2),Y=N*Q,T=C*L;if(b<1&&(m.globalAlpha=b),m.drawImage(n,G,q,N,C,l/2-Y/2,s/2-T/2,Y,T),b<1&&(m.globalAlpha=1),m.globalCompositeOperation="destination-in",Xe(m,0,0,v,O,V,M,a),m.fillStyle="#000",m.fill(),m.globalCompositeOperation="destination-out",Xe(m,F,F,v-2*F,O-2*F,Math.max(0,V-F),M,a),m.fill(),e.wantRing){let _=e.ringCanvas;_||(_=document.createElement("canvas"),e.ringCanvas=_),(_.width!==i||_.height!==r)&&(_.width=i,_.height=r);const E=_.getContext("2d");E&&(E.setTransform(1,0,0,1,0,0),E.globalCompositeOperation="source-over",E.clearRect(0,0,i,r),E.translate(c,c),b<1&&(E.globalAlpha=b),E.drawImage(n,G,q,N,C,l/2-Y/2,s/2-T/2,Y,T),E.globalAlpha=1,E.globalCompositeOperation="destination-out",Xe(E,F,F,v-2*F,O-2*F,Math.max(0,V-F),M,a),E.fillStyle="#000",E.fill(),E.globalCompositeOperation="source-over",E.setTransform(1,0,0,1,0,0))}if(I!=null&&I.hairline){const _=I.hairline;m.globalCompositeOperation="destination-over",Xe(m,_.inset,_.inset,v-2*_.inset,O-2*_.inset,Math.max(0,V-_.inset),M,a),m.lineWidth=_.width*a,m.strokeStyle=_.color,m.stroke()}if(I!=null&&I.fill&&(m.globalCompositeOperation="destination-over",Xe(m,0,0,v,O,V,M,a),m.fillStyle=I.fill,m.fill()),I!=null&&I.rim){const _=I.rim;m.globalCompositeOperation="source-over",m.save(),Xe(m,0,0,v,O,V,M,a),m.clip();const E=_.inset+_.width/2;Xe(m,E,E,v-2*E,O-2*E,Math.max(0,V-E),M,a),m.lineWidth=_.width*a,m.strokeStyle=_.color,m.stroke(),m.restore()}m.restore(),m.globalCompositeOperation="source-over"}if((t=e.onComposite)==null||t.call(e),e.onFirstCopy){const v=e.onFirstCopy;e.onFirstCopy=void 0,v()}(o=e.onAfterFrame)==null||o.call(e)}function Gn(){if(!x)return;const{gl:e,uniforms:t,preset:o,glCanvas:n,dpr:a}=x;t.u_resolution&&e.uniform2f(t.u_resolution,n.width,n.height),t.u_pixelRatio&&e.uniform1f(t.u_pixelRatio,a),t.u_colorBack&&e.uniform4fv(t.u_colorBack,Ho(o.colorBack)),t.u_colorTint&&e.uniform4fv(t.u_colorTint,Ho(o.colorTint)),t.u_repetition&&e.uniform1f(t.u_repetition,o.repetition),t.u_softness&&e.uniform1f(t.u_softness,o.softness),t.u_shiftRed&&e.uniform1f(t.u_shiftRed,o.shiftRed),t.u_shiftBlue&&e.uniform1f(t.u_shiftBlue,o.shiftBlue),t.u_distortion&&e.uniform1f(t.u_distortion,o.distortion),t.u_contour&&e.uniform1f(t.u_contour,o.contour),t.u_angle&&e.uniform1f(t.u_angle,o.angle),t.u_shape&&e.uniform1f(t.u_shape,o.shape),t.u_isImage&&e.uniform1i(t.u_isImage,0),t.u_imageAspectRatio&&e.uniform1f(t.u_imageAspectRatio,1),t.u_originX&&e.uniform1f(t.u_originX,o.originX),t.u_originY&&e.uniform1f(t.u_originY,o.originY),t.u_worldWidth&&e.uniform1f(t.u_worldWidth,o.worldWidth),t.u_worldHeight&&e.uniform1f(t.u_worldHeight,o.worldHeight),t.u_fit&&e.uniform1f(t.u_fit,o.fit),t.u_scale&&e.uniform1f(t.u_scale,o.scale),t.u_rotation&&e.uniform1f(t.u_rotation,o.rotation),t.u_offsetX&&e.uniform1f(t.u_offsetX,o.offsetX),t.u_offsetY&&e.uniform1f(t.u_offsetY,o.offsetY),x.presetDirty=!1}function Hn(e){if(!x)return;const{gl:t,uniforms:o,preset:n,glCanvas:a}=x,i=(e-x.startMs-x.pausedMs)/1e3*n.speed;t.viewport(0,0,a.width,a.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),x.presetDirty&&Gn(),o.u_time&&t.uniform1f(o.u_time,i),t.drawArrays(t.TRIANGLES,0,6),x.frameCount++}let Jo=0;function Pa(e){var t;if(!x)return;if(x.contextLost){x.rafId=0;return}let o=!1;for(const n of x.instances)if(n.visible&&(!n.paused||!n.everCopied)){o=!0;break}if(!o){x.rafId=0;return}if(x.rafId=requestAnimationFrame(Pa),e-Jo<sn){if(qe)for(const n of x.glowQueue)n.glowFast&&n.visible&&!n.paused&&(n.glowFast=!!qe(n,e));return}Jo=e,Hn(e),An(),x.useOffscreen&&((t=x.frameBitmap)==null||t.close(),x.frameBitmap=x.glCanvas.transferToImageBitmap());for(const n of x.instances)n.visible&&(n.paused&&n.everCopied||(Gt(n),n.everCopied=!0));if(qe&&x.glowQueue.length>0&&++x.glowSkip%un===0)for(const n of x.glowQueue)n.visible&&!n.paused&&(n.glowFast=!!qe(n,e))}function Tt(){!x||x.rafId!==0||(x.rafId=requestAnimationFrame(Pa))}function La(){x&&(x.rafId!==0&&cancelAnimationFrame(x.rafId),x.rafId=0)}const ho={linear:e=>e,smoothstep:e=>e*e*(3-2*e)};function wt(e,t,o,n=ho.linear){return{from:e,to:t,dur:o,ease:n,startMs:-1,val:e,done:!1}}function yt(e,t){e.startMs=t,e.val=e.from,e.done=!1}function Ko(e,t){if(e.done||e.startMs<0)return e.val;const o=Math.min(1,(t-e.startMs)/e.dur);return e.val=e.from+(e.to-e.from)*e.ease(o),o>=1&&(e.done=!0),e.val}const $n=Object.freeze({haloOpMul:2,extraIntensity:3.51,peakOp:.85,baseOp:.34,inset:1.5,extraOutward:1,wanderRange:15,wanderLerp:.0075,fadeRate:.00875,lumLo:.08,lumHi:.32,minDwellMs:1500,relocFadeMs:300,relocFadeOutMs:450,pointGain:2.5,haloHalfLen:7.8,extraHalfLen:9.13952/3,haloStrokeXl:26.4,haloStrokeLg:15.6,haloStrokeMd:7.2,haloStrokeSm:3,haloBlurXl:8.4,haloBlurLg:4.8,haloBlurMd:2.1,haloBlurSm:.9,haloOpXl:.385,haloOpLg:.595,haloOpMd:.7,haloOpSm:.7,extraStrokeOuter:4/3,extraStrokeCore:2/3,extraBlurOuter:2/3,extraBlurCore:1.35/3,extraFadeR:13/3,extraOpOuter:.85}),S={...$n},Zo=new Set;function Xn(e){return Zo.add(e),()=>{Zo.delete(e)}}const Yn=Object.freeze({enabled:!0,reach:56,fadeMs:200,cursor:!0,cursorDistance:186,cursorStrength:3.35,cursorDiffuse:1.4,cursorFalloff:37,cursorDepth:.4,cursorEdge:0,cursorReach:11.5,cursorBlur:.5,cursorZoom:3,spill:!1,spillRadius:48,spillStrength:.55,spillOffset:.35,spillLumGain:.7,spillSaturation:1.3,spillInside:.5,spillBlur:0,catchLight:!1,catchFollow:.25,catchGain:1}),Mt={...Yn};let Ua=!1,Na=0,Pt=0,_t=0,gt=!1,Qe=0,fo=0,Ee=Number.NaN,je=Number.NaN,mo=0,po=0,Ye=0,lt=0,oe=null;const ne={d:0,nx:0,ny:0,k:1,left:0,top:0},to={x:0,y:0},ke={r:255,g:255,b:255};let Be=null,go="",xo=-1,vo=-1,St=!1;function qn(){_t++,Jn()}function jn(){_t=Math.max(0,_t-1),_t===0&&Kn()}const Qn=e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches;function ea(){return Ua||performance.now()<Na,!1}function Jn(){gt||_t===0||typeof document>"u"||Qn("(pointer: fine)")&&(gt=!0,document.addEventListener("pointermove",za,{passive:!0}),document.addEventListener("pointerleave",Ve),document.addEventListener("pointercancel",Ve),document.addEventListener("keydown",Va,{passive:!0}),document.addEventListener("visibilitychange",Ve),window.addEventListener("blur",Ve))}function Kn(){gt&&(gt=!1,document.removeEventListener("pointermove",za),document.removeEventListener("pointerleave",Ve),document.removeEventListener("pointercancel",Ve),document.removeEventListener("keydown",Va),document.removeEventListener("visibilitychange",Ve),window.removeEventListener("blur",Ve),Qe!==0&&(cancelAnimationFrame(Qe),Qe=0),oe&&(oe.cursorLight=null,oe=null),Ye=0,lt=0,Be&&(Be.remove(),Be=null,go="",xo=-1,vo=-1,St=!1),Ke(),De&&(De.remove(),De=null))}let bo=!0,To=!1;function za(e){bo=e.pointerType==="mouse"||e.pointerType==="",To=!1,Ee=mo=e.clientX,je=po=e.clientY,wo&&De&&(bo&&Wa(Ee,je)?void 0:Ke()),Da()}function Va(){To=!0,Ke()}function Ve(){Ee=je=Number.NaN,Da()}function Da(){!gt||Qe!==0||(fo=performance.now(),Qe=requestAnimationFrame(Ga))}function Zn(e,t,o,n,a,i,r){const l=i==="circle"?Math.min(o,n)/2:Math.max(0,Math.min(a,Math.min(o,n)/2)),s=o/2,c=n/2,u=Math.max(0,o/2-l),d=Math.max(0,n/2-l),h=Math.max(-u,Math.min(u,e-s)),g=Math.max(-d,Math.min(d,t-c)),p=e-s-h,f=t-c-g,y=Math.hypot(p,f);if(y>1e-6)return r.x=s+h+p/y*l,r.y=c+g+f/y*l,y-l;const w=e,b=o-e,m=t,M=n-t,v=Math.min(w,b,m,M);return v===w?(r.x=0,r.y=t):v===b?(r.x=o,r.y=t):v===m?(r.x=e,r.y=0):(r.x=e,r.y=n),-v}let De=null,wo=!1,ht=!1,yo="",Ae=null,Rt="";const er=/^(INPUT|TEXTAREA|SELECT)$/;let Mo=new WeakMap,ta=0,_o=null;function tr(e){let t=e;for(;t&&t!==document.body;){if(er.test(t.tagName)||t.isContentEditable)return!0;t=t.parentElement}return!1}function or(){if(De)return!0;const e=document.createElement("div");e.className="metal-fx-cursor",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483001;will-change:transform;transform-origin:0 0;display:none";const t=document.createElement("canvas");t.style.display="block",e.appendChild(t),document.body.appendChild(e);const o=t.getContext("2d"),n=document.createElement("canvas"),a=n.getContext("2d");return!o||!a?(e.remove(),!1):(De=e,!0)}function Wa(e,t,o=!1){const n=performance.now();if(!o&&ht&&n-ta<12)return!0;ta=n;const a=document.elementFromPoint(e,t);if(!a)return Ro(),!1;if(a===_o&&ht)return!0;_o=a;let i=Mo.get(a);if(i===void 0){if(i=!tr(a),i){const r=getComputedStyle(a).cursor;i=r==="auto"||r==="default"||r==="none"}Mo.set(a,i)}if(!i)return Ro(),!1;if(!ht){const r=document.documentElement;yo=r.style.cursor,r.style.cursor="none",ht=!0}return a!==Ae&&(Ae&&(Ae.style.cursor=Rt,Ae=null,Rt=""),getComputedStyle(a).cursor!=="none"&&(Ae=a,Rt=a.style.cursor,a.style.cursor="none")),!0}function Ro(){Ae&&(Ae.isConnected&&(Ae.style.cursor=Rt),Ae=null,Rt=""),ht&&(document.documentElement.style.cursor=yo,ht=!1,yo=""),_o=null,Mo=new WeakMap}function Ke(){Ro(),De&&wo&&(De.style.display="none",wo=!1)}function ar(){if(Be)return Be;const e=document.createElement("div");return e.className="metal-fx-cursor-spill",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;border-radius:50%;mix-blend-mode:plus-lighter;will-change:transform,opacity;opacity:0;display:none",document.body.appendChild(e),Be=e,e}function Co(){!Be||!St||(Be.style.display="none",Be.style.opacity="0",St=!1)}function Ga(e){if(Qe=0,!gt)return;const t=performance.now();try{nr(e)}catch(o){Ua=!0,Ke(),Co(),oe&&(oe.cursorLight=null,oe=null),typeof console<"u"&&console.warn("metal-fx: cursor light disabled after error",o);return}performance.now()-t>6?++Pt>=20&&(Pt=0,Na=performance.now()+5e3,Ke()):Pt>0&&Pt--}function nr(e){const t=Mt,o=Math.min(.05,Math.max(.001,(e-fo)/1e3));fo=e;let n=null,a=0,i=0;if(t.enabled&&x&&!Number.isNaN(Ee)){let l=Number.POSITIVE_INFINITY;const s=Math.max(1,t.reach),c=t.cursor&&ea()?Math.max(1,t.cursorDistance):0,u=Math.max(s,c);for(const d of x.instances){if(!d.visible||!d.canvas.isConnected)continue;const h=d.canvas.getBoundingClientRect();if(h.width<=0)continue;const g=d.overscan,p=h.width/(d.cssWidth+2*g),f=h.left+g*p,y=h.top+g*p,w=u*p;if(Ee<f-w||Ee>f+d.cssWidth*p+w||je<y-w||je>y+d.cssHeight*p+w)continue;const b=(Ee-f)/p,m=(je-y)/p,M=Zn(b,m,d.cssWidth,d.cssHeight,d.cornerRadius,d.kind,to),v=Math.abs(M);v<=u&&v<l&&(l=v,n=d,ne.d=M,ne.nx=to.x,ne.ny=to.y,ne.k=p,ne.left=f,ne.top=y)}if(n){if(l<=s){const d=1-l/s;a=d*d*(3-2*d)}l<=c&&(i=Math.min(1,(1-l/c)*3)),n.mask&&(ne.nx=n.cssWidth/2,ne.ny=n.cssHeight/2,n.wantRaw=!0)}}const r=1-Math.exp(-(o*1e3)/(Math.max(1,t.fadeMs)/3));if(Ye+=(a-Ye)*r,lt+=(i-lt)*r,n&&n!==oe&&(oe&&(oe.cursorLight=null,eo(oe,e)),oe=n),!n&&Ye<.002&&lt<.002){Ye=0,lt=0,oe&&(oe.cursorLight=null,eo(oe,e),oe=null),Co(),Ke();return}if(oe){if(t.catchLight){const l=oe.cursorLight??(oe.cursorLight={x:0,y:0,w:0});l.x=ne.nx,l.y=ne.ny,l.w=Ye}else oe.cursorLight&&(oe.cursorLight=null);if(eo(oe,e),t.cursor&&lt>.002&&bo&&!To&&!Number.isNaN(Ee)&&ea()&&or()&&Wa(Ee,je)?void 0:Ke(),t.spill){const l=ar(),s=Oa(oe,ne.nx,ne.ny,2),c=uo(oe,ne.nx,ne.ny,3),u=Math.max(s.r,s.g,s.b)||1,d=_a(s.r*255/u,s.g*255/u,s.b*255/u),[h,g,p]=Ra(d[0],Math.min(1,d[1]*t.spillSaturation),1);ke.r+=(h-ke.r)*.15,ke.g+=(g-ke.g)*.15,ke.b+=(p-ke.b)*.15;const f=Math.round(ke.r/6)*6,y=Math.round(ke.g/6)*6,w=Math.round(ke.b/6)*6,b=`radial-gradient(closest-side, rgba(${f},${y},${w},1) 0%, rgba(${f},${y},${w},0.35) 45%, rgba(${f},${y},${w},0) 100%)`;b!==go&&(go=b,l.style.background=b);const m=Math.max(1,t.spillRadius*ne.k);m!==xo&&(xo=m,l.style.width=`${(2*m).toFixed(1)}px`,l.style.height=`${(2*m).toFixed(1)}px`),t.spillBlur!==vo&&(vo=t.spillBlur,l.style.filter=t.spillBlur>0?`blur(${t.spillBlur}px)`:"");const M=ne.left+ne.nx*ne.k,v=ne.top+ne.ny*ne.k,O=mo+(M-mo)*t.spillOffset,V=po+(v-po)*t.spillOffset;l.style.transform=`translate3d(${(O-m).toFixed(2)}px,${(V-m).toFixed(2)}px,0)`;const F=Math.min(1,Math.max(0,c/.3)),I=1-t.spillLumGain+t.spillLumGain*F,Q=ne.d<0?t.spillInside:1,L=Math.max(0,Math.min(1,t.spillStrength*Ye*I*Q));St||(l.style.display="",St=!0),l.style.opacity=L.toFixed(3)}else Co();Qe=requestAnimationFrame(Ga)}}const zt=new Map;function rr(e,t){const o=Math.sqrt(12*e*e/t+1);let n=Math.floor(o);n%2===0&&n--;const a=n+2,i=(12*e*e-t*n*n-4*t*n-3*t)/(-4*n-4),r=Math.round(i),l=[];for(let s=0;s<t;s++)l.push(s<r?n:a);return l}function ir(e,t,o,n,a){const i=1/(a+a+1);for(let r=0;r<n;r++){const l=r*o;let s=0;for(let c=-a;c<=a;c++)s+=e[l+Math.min(o-1,Math.max(0,c))];for(let c=0;c<o;c++){t[l+c]=s*i;const u=l+Math.max(0,c-a),d=l+Math.min(o-1,c+a+1);s+=e[d]-e[u]}}}function sr(e,t,o,n,a){const i=1/(a+a+1);for(let r=0;r<o;r++){let l=0;for(let s=-a;s<=a;s++)l+=e[Math.min(n-1,Math.max(0,s))*o+r];for(let s=0;s<n;s++){t[s*o+r]=l*i;const c=Math.max(0,s-a)*o+r,u=Math.min(n-1,s+a+1)*o+r;l+=e[u]-e[c]}}}function Eo(e,t,o,n){if(n<=.05)return e;const a=new Float32Array(e.length);let i=e;for(const r of rr(n,3)){const l=(r-1)/2;ir(i,a,t,o,l),sr(a,i,t,o,l)}return i}function lr(e,t,o,n,a,i,r){const l=document.createElement("canvas");l.width=o,l.height=n;const s=l.getContext("2d",{willReadFrequently:!0}),c=new Float32Array(o*n);if(!s)return c;s.scale(a,a),s.strokeStyle="#fff",s.lineCap="round",s.lineJoin="round",s.lineWidth=t,s.beginPath(),s.moveTo(i-e,r),s.lineTo(i+e,r),s.stroke();const u=s.getImageData(0,0,o,n).data;for(let d=0,h=3;d<c.length;d++,h+=4)c[d]=u[h]/255;return c}function Ha(e,t,o,n,a){let i=0;for(const f of e)i=Math.max(i,(f.stroke/2+3*f.blur)*o);const r=Math.ceil(i)+1,l=2*t+2*r,s=2*r,c=Math.ceil(l*n),u=Math.ceil(s*n),d=new Float32Array(c*u);for(const f of e){let y=lr(t,f.stroke*o,c,u,n,r,r);y=Eo(y,c,u,f.blur*o*n);const w=f.opacity;for(let b=0;b<d.length;b++){const m=y[b]*w;d[b]=d[b]+m*(1-d[b])}}if(a>0){const f=r*n,y=r*n,w=a*o*n;for(let b=0;b<u;b++)for(let m=0;m<c;m++){const M=Math.hypot(m+.5-f,b+.5-y)/w;let v;M<=.3?v=1:M<=.65?v=1-(M-.3)/.35*.75:M<1?v=.25*(1-(M-.65)/.35):v=0,d[b*c+m]*=v}}const h=document.createElement("canvas");h.width=c,h.height=u;const g=h.getContext("2d"),p=new Uint8ClampedArray(c*u);for(let f=0;f<d.length;f++)p[f]=Math.round(Math.min(1,d[f])*255);if(g){const f=g.createImageData(c,u),y=f.data;for(let w=0,b=0;w<d.length;w++,b+=4)y[b]=255,y[b+1]=255,y[b+2]=255,y[b+3]=p[w];g.putImageData(f,0,0)}return{canvas:h,alpha:p,w:l,h:s,ax:r,ay:r}}function $a(){return[S.haloStrokeXl,S.haloStrokeLg,S.haloStrokeMd,S.haloStrokeSm,S.haloBlurXl,S.haloBlurLg,S.haloBlurMd,S.haloBlurSm,S.haloOpXl,S.haloOpLg,S.haloOpMd,S.haloOpSm,S.extraStrokeOuter,S.extraStrokeCore,S.extraBlurOuter,S.extraBlurCore,S.extraFadeR,S.extraOpOuter].join(",")}function cr(e,t,o){const n=`h|${e.toFixed(2)}|${t}|${o}|${$a()}`;let a=zt.get(n);return a||(a=Ha([{stroke:S.haloStrokeXl,blur:S.haloBlurXl,opacity:S.haloOpXl},{stroke:S.haloStrokeLg,blur:S.haloBlurLg,opacity:S.haloOpLg},{stroke:S.haloStrokeMd,blur:S.haloBlurMd,opacity:S.haloOpMd},{stroke:S.haloStrokeSm,blur:S.haloBlurSm,opacity:S.haloOpSm}],e,t,o,0),zt.set(n,a)),a}function ur(e,t,o){const n=`e|${e.toFixed(2)}|${t}|${o}|${$a()}`;let a=zt.get(n);return a||(a=Ha([{stroke:S.extraStrokeOuter,blur:S.extraBlurOuter,opacity:S.extraOpOuter},{stroke:S.extraStrokeCore,blur:S.extraBlurCore,opacity:1}],e,t,o,S.extraFadeR),zt.set(n,a)),a}function oa(e,t,o,n,a){var i;const r=t<<16|o<<8|n;if(a.canvas&&a.tint===r&&a.src===e)return a.canvas;let l=a.canvas,s=a.img;(!l||!s||a.src!==e)&&(l=document.createElement("canvas"),l.width=e.canvas.width,l.height=e.canvas.height,s=((i=l.getContext("2d"))==null?void 0:i.createImageData(l.width,l.height))??null);const c=l.getContext("2d");if(c&&s){const u=s.data,d=e.alpha;for(let h=0,g=0;h<d.length;h++,g+=4)u[g]=t,u[g+1]=o,u[g+2]=n,u[g+3]=d[h];c.putImageData(s,0,0)}return a.canvas=l,a.img=s,a.tint=r,a.src=e,l}function Ao(e,t,o){const n=Math.max(0,Math.min(o,Math.min(e,t)/2));return 2*Math.max(0,e-2*n)+2*Math.max(0,t-2*n)+2*Math.PI*n}function Vt(e,t,o,n){return n==="circle"?2*Math.PI*Math.max(0,Math.min(o,Math.min(e,t)/2)):Ao(e,t,o)}function kt(e,t,o,n,a,i,r,l){const s=l||{x:0,y:0},c=Math.max(0,Math.min(n,Math.min(t,o)/2));if(r==="circle"){const w=2*Math.PI*c;if(w<=1e-4)return s.x=t*.5,s.y=o*.5,s;e=(e%w+w)%w;const b=-Math.PI/2+e/w*Math.PI*2,m=Math.max(0,c-a+i);return s.x=t*.5+m*Math.cos(b),s.y=o*.5+m*Math.sin(b),s}const u=Math.max(0,t-2*c),d=Math.max(0,o-2*c),h=Math.PI*c/2,g=2*(u+d)+4*h;e=(e%g+g)%g;const p=Math.max(0,c-a+i);let f=e;if(f<u)return s.x=c+f,s.y=a-i,s;if(f-=u,f<h){const w=-Math.PI/2+(h>0?f/h:0)*(Math.PI/2);return s.x=t-c+p*Math.cos(w),s.y=c+p*Math.sin(w),s}if(f-=h,f<d)return s.x=t-a+i,s.y=c+f,s;if(f-=d,f<h){const w=(h>0?f/h:0)*(Math.PI/2);return s.x=t-c+p*Math.cos(w),s.y=o-c+p*Math.sin(w),s}if(f-=h,f<u)return s.x=t-c-f,s.y=o-a+i,s;if(f-=u,f<h){const w=Math.PI/2+(h>0?f/h:0)*(Math.PI/2);return s.x=c+p*Math.cos(w),s.y=o-c+p*Math.sin(w),s}if(f-=h,f<d)return s.x=a-i,s.y=o-c-f,s;f-=d;const y=Math.PI+(h>0?f/h:0)*(Math.PI/2);return s.x=c+p*Math.cos(y),s.y=c+p*Math.sin(y),s}function dr(e,t,o,n,a,i){const r=Math.max(0,Math.min(a,Math.min(o,n)/2));if(i==="circle"){const v=2*Math.PI*r;return v<=1e-4?0:((Math.atan2(t-n/2,e-o/2)+Math.PI/2)/(2*Math.PI)*v%v+v)%v}const l=Math.max(0,o-2*r),s=Math.max(0,n-2*r),c=Math.PI*r/2,u=Math.PI/2,d=l,h=d+c,g=h+s,p=g+c,f=p+l,y=f+c,w=y+s,b=e>=r&&e<=o-r,m=t>=r&&t<=n-r;if(b&&m){const v=e,O=o-e,V=t,F=n-t,I=Math.min(v,O,V,F);return I===V?e-r:I===O?h+(t-r):I===F?p+(o-r-e):y+(n-r-t)}if(b)return t<n/2?e-r:p+(o-r-e);if(m)return e>o/2?h+(t-r):y+(n-r-t);if(e>o/2&&t<n/2){const v=Math.atan2(t-r,e-(o-r));return d+(v+u)/u*c}if(e>o/2){const v=Math.atan2(t-(n-r),e-(o-r));return g+v/u*c}if(t>n/2){const v=Math.atan2(t-(n-r),e-r);return f+(v-u)/u*c}const M=Math.atan2(t-r,e-r);return w+(M+Math.PI)/u*c}const oo={x:0,y:0},ao={x:0,y:0};function hr(e,t,o,n,a,i){return kt(e-.1,t,o,n,a,0,i,oo),kt(e+.1,t,o,n,a,0,i,ao),Math.atan2(ao.y-oo.y,ao.x-oo.x)}function aa(e,t,o){if(e===t)return o<e?0:1;const n=Math.max(0,Math.min(1,(o-e)/(t-e)));return n*n*(3-2*n)}function fr(e){if(e.samplePoints&&e.samplePoints.length>0)return e.samplePoints.map((a,i)=>({x:a.x,y:a.y,arc:i}));const t=Vt(e.width,e.height,e.cornerRadius,e.kind),o=S.inset*(e.scale??1),n=[];for(let a=0;a<$o;a++){const i=a/$o*t,r=kt(i,e.width,e.height,e.cornerRadius,o,0,e.kind);n.push({x:r.x,y:r.y,arc:i})}return n}const mr=.05,pr=120*(1e3/15),na=1e3/15,ra=2e3,no=400,gr=2.625,xr=1.008,vr=.31,Xa=140,Ya=40,qa=20,br=34,Lt=.25,wr=.01,ia=.004,yr=.5,Mr=3.5,we={x:0,y:0};function sa(e,t){const{width:o,height:n}=t,a=t.scale??1,i=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),r=Vt(o,n,t.cornerRadius,t.kind)/Ao(Xa,Ya,qa),l=Math.max(1,S.haloHalfLen*r),s=Math.max(.6,S.extraHalfLen*r),c=cr(l,a,i),u=ur(s,a,i),d=Math.ceil(Math.max(c.ay,u.ay)+S.extraOutward*r*a+2),h=document.createElement("div");h.className="metal-fx-glow-svg",h.setAttribute("aria-hidden","true");const g=document.createElement("div");g.className="metal-fx-glow-env",g.style.cssText="position:absolute;inset:0;pointer-events:none;opacity:0";const p=document.createElement("canvas");p.className="metal-fx-glow-canvas";const f=o+2*d,y=n+2*d;p.width=Math.ceil(f*i),p.height=Math.ceil(y*i),p.style.cssText=`position:absolute;left:${-d}px;top:${-d}px;width:${f}px;height:${y}px;pointer-events:none`,g.appendChild(p),h.appendChild(g),e.appendChild(h);const w=p.getContext("2d",{willReadFrequently:!!t.maskDataUrl});if(!w)throw new Error("metal-fx: glow canvas 2D context unavailable");const b={wrap:h,env:g,canvas:p,ctx:w,surroundPath:null,bandPath:null,maskAlpha:null,maskReady:!1,margin:d,dpr:i,halo:c,extra:u,haloTint:{canvas:null,img:null,tint:-1,src:null},extraTint:{canvas:null,img:null,tint:-1,src:null},mO:mt(),mI:mt(),maskSum:Number.NaN,maskDeformed:!1,deform:null,width:o,height:n,cornerRadius:t.cornerRadius,kind:t.kind,scale:a,perim:fr(t),pointMode:!!(t.samplePoints&&t.samplePoints.length>0),currentIdx:0,appearedAt:0,glowOpacity:0,relocTween:null,relocNextIdx:-1,relocMul:0,envClock:0,cursorMode:!1,cursorArc:0,cursorTargetArc:0,lastTickMs:0,wanderS:0,wanderTargetS:0,wanderFrames:0,tintFrom:{r:255,g:255,b:255},tintTarget:{r:255,g:255,b:255},tintTween:null,tintHoldUntil:0,dX:Number.NaN,dY:Number.NaN,dAng:Number.NaN,dEX:Number.NaN,dEY:Number.NaN,dHOp:Number.NaN,dEOp:Number.NaN,dHaloTint:"",dExtraTint:"",dirty:!0,dEnv:-1};if(t.maskDataUrl){const m=new Image;m.onload=()=>{const M=document.createElement("canvas");M.width=p.width,M.height=p.height;const v=M.getContext("2d",{willReadFrequently:!0});if(!v)return;v.scale(i,i),v.drawImage(m,d,d,o,n);const O=v.getImageData(0,0,M.width,M.height).data,V=M.width*M.height,F=new Float32Array(V);for(let C=0,G=3;C<V;C++,G+=4)F[C]=O[G]/255;const I=Eo(Float32Array.from(F),M.width,M.height,Mr*i);let Q=0;for(let C=0;C<V;C++)I[C]>Q&&(Q=I[C]);const L=Q>0?yr/Q:0,N=new Uint8ClampedArray(V);for(let C=0;C<V;C++)N[C]=Math.round(Math.max(F[C],I[C]*L)*255);b.maskAlpha=N,b.maskReady=!0,b.dirty=!0},m.src=t.maskDataUrl}else So(b,null);return b}function So(e,t){if(e.pointMode)return;const{margin:o,width:n,height:a,cornerRadius:i}=e,r=e.kind==="circle"?2:1;pt(0,0,n,a,i,t,e.mO),pt(r,r,n-2*r,a-2*r,Math.max(0,i-r),t,e.mI);const l=new Path2D;ro(l,e.mO,o);const s=new Path2D;ro(s,e.mO,o),ro(s,e.mI,o);const c=new Path2D;c.rect(0,0,n+2*o,a+2*o),c.addPath(l),e.surroundPath=c,e.bandPath=s,e.maskReady=!0}function ro(e,t,o){const n=t.xy;for(let a=0;a<t.n;a++){const i=n[a*2]+o,r=n[a*2+1]+o;a===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function _r(e,t){if(!e)return 0;pt(0,0,t.width,t.height,t.cornerRadius,e,t.mO);let o=0;const n=t.mO.xy;for(let a=0;a<t.mO.n;a+=4)o+=n[a*2]*1.37+n[a*2+1];return o}function Rr(e,t){if(e.deform=t,!e.pointMode)if(t){const o=_r(t,e);o!==e.maskSum&&(e.maskSum=o,So(e,t),e.maskDeformed=!0,e.dirty=!0)}else e.maskDeformed&&(e.maskSum=Number.NaN,So(e,null),e.maskDeformed=!1,e.dirty=!0)}function Cr(e,t,o,n,a="dark"){var i;const{width:r,height:l,cornerRadius:s,perim:c}=e;if(c.length===0)return!1;const u=2;let d=-1,h=e.currentIdx,g=0;for(let A=0;A<c.length;A++){const X=c[A],H=uo(t,X.x,X.y,u);H>d&&(d=H,h=A),A===e.currentIdx&&(g=H)}const p=e.appearedAt>0&&o-e.appearedAt<S.minDwellMs,f=S.baseOp+(S.peakOp-S.baseOp)*aa(S.lumLo,S.lumHi,g),y=!p&&d-g>mr,w=t.cursorLight,b=Mt.enabled&&Mt.catchLight&&!e.pointMode&&!!w&&w.w>.02,m=Vt(r,l,s,e.kind);b&&(e.cursorTargetArc=dr(w.x,w.y,r,l,s,e.kind));const M=b?Math.min(1,S.peakOp*Mt.catchGain*w.w):0,v=e.lastTickMs>0?Math.min(200,Math.max(.5,o-e.lastTickMs)):na;e.lastTickMs=o,e.envClock+=Math.min(v,br);const O=A=>1-Math.pow(1-A,v/na),V=Math.max(1,S.relocFadeMs),F=Math.max(1,S.relocFadeOutMs),I=-2,Q=-3,L=()=>{e.appearedAt=o,e.wanderS=0,e.wanderTargetS=0,e.wanderFrames=0,e.relocTween=wt(0,1,V,ho.smoothstep),yt(e.relocTween,e.envClock)},N=A=>{e.relocNextIdx=A,e.relocTween=wt(1,0,F,ho.smoothstep),yt(e.relocTween,e.envClock)};if((i=e.relocTween)!=null&&i.done&&e.relocTween.to===0){let A=e.relocNextIdx;if(A===I&&!b&&(A=Q),A===Q)e.cursorMode=!1,e.appearedAt=0,e.relocTween=null;else if(A===I)e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=M,L();else{e.currentIdx=A;const X=c[e.currentIdx],H=uo(t,X.x,X.y,u);e.glowOpacity=S.baseOp+(S.peakOp-S.baseOp)*aa(S.lumLo,S.lumHi,H),L()}}if((!e.relocTween||e.relocTween.done)&&(e.appearedAt===0?(b?(e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=M):(e.cursorMode=!1,e.currentIdx=h,e.glowOpacity=f),L()):b!==e.cursorMode?N(b?I:Q):!e.cursorMode&&y&&N(h)),e.cursorMode){b&&(e.glowOpacity=M);const A=Math.max(.01,Math.min(1,Mt.catchFollow)),X=1-Math.pow(1-A,v/(1e3/60));let H=e.cursorTargetArc-e.cursorArc;H=(H%m+m*1.5)%m-m/2,e.cursorArc+=H*X}else e.glowOpacity+=(f-e.glowOpacity)*O(S.fadeRate);e.glowOpacity=Math.max(0,Math.min(1,e.glowOpacity)),e.relocMul=e.relocTween?Ko(e.relocTween,e.envClock):1;const C=Vt(r,l,s,e.kind)/Ao(Xa,Ya,qa),G=S.wanderRange*C;e.wanderFrames+=v,e.wanderFrames>=pr&&(e.wanderTargetS=(Math.random()*2-1)*G,e.wanderFrames=0),e.wanderS+=(e.wanderTargetS-e.wanderS)*O(S.wanderLerp);let q,Y,T,_,E;if(e.pointMode){const A=c[e.currentIdx];q=A.x+e.wanderS,Y=A.y,T=0,_=q,E=Y}else{const A=e.cursorMode?e.cursorArc:c[e.currentIdx].arc+e.wanderS,X=S.inset*e.scale;kt(A,r,l,s,X,0,e.kind,we),q=we.x,Y=we.y,T=hr(A,r,l,s,X,e.kind);const H=S.extraOutward*C*e.scale;kt(A,r,l,s,X,H,e.kind,we),_=we.x,E=we.y}e.deform&&(e.deform(q,Y,we),q=we.x,Y=we.y,e.deform(_,E,we),_=we.x,E=we.y);const Z=a==="light",ee=Z?Bn(t,q,Y,u):Oa(t,q,Y,u);e.tintTween?e.tintTween.done&&(Z?(e.tintFrom={r:e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*e.tintTween.val,g:e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*e.tintTween.val,b:e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*e.tintTween.val},e.tintTarget={...ee},e.tintTween=wt(0,1,no),yt(e.tintTween,o)):o>=e.tintHoldUntil&&(e.tintFrom={...e.tintTarget},e.tintTarget={...ee},e.tintTween=wt(0,1,no),yt(e.tintTween,o),e.tintHoldUntil=o+ra)):(e.tintFrom={...ee},e.tintTarget={...ee},e.tintTween=wt(0,1,no),yt(e.tintTween,o),e.tintHoldUntil=Z?0:o+ra),Ko(e.tintTween,o);const te=e.tintTween.val;let P,B,z;if(Z)P=Math.round(e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*te),B=Math.round(e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*te),z=Math.round(e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*te);else{const A=e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*te,X=e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*te,H=e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*te,re=Math.max(A,X,H)||1;P=Math.round(255*(A/re)),B=Math.round(255*(X/re)),z=Math.round(255*(H/re))}const D=`rgb(${P},${B},${z})`;let U="#ffffff";if(Z){const A=_a(P,B,z),[X,H,re]=Ra(A[0],Math.min(1,A[1]*gr),Math.max(vr,A[2]*xr));U=`rgb(${X},${H},${re})`}const ie=Math.max(0,Math.min(1,n))*(e.pointMode?S.pointGain:1),he=Math.min(1,e.glowOpacity*S.haloOpMul*ie),me=Math.min(1,e.glowOpacity*S.extraIntensity*ie);if(Math.abs(e.relocMul-e.dEnv)>.002){const A=e.relocMul>=.998&&e.dEnv<.998;e.dEnv=e.relocMul,e.env.style.opacity=e.relocMul.toFixed(3),A&&(e.dirty=!0)}const fe=!!(e.relocTween&&!e.relocTween.done)||e.cursorMode,ge=!(Math.abs(q-e.dX)<Lt&&Math.abs(Y-e.dY)<Lt&&Math.abs(T-e.dAng)<wr&&Math.abs(_-e.dEX)<Lt&&Math.abs(E-e.dEY)<Lt),le=!(Math.abs(he-e.dHOp)<ia&&Math.abs(me-e.dEOp)<ia),ce=D!==e.dHaloTint||U!==e.dExtraTint;return(e.dirty||ge||le||ce)&&(e.dX=q,e.dY=Y,e.dAng=T,e.dEX=_,e.dEY=E,e.dHOp=he,e.dEOp=me,e.dHaloTint=D,e.dExtraTint=U,e.dirty=!1,Sr(e,q,Y,T,_,E,he,me,D,U)),fe}function Sr(e,t,o,n,a,i,r,l,s,c){const{ctx:u,canvas:d,dpr:h,margin:g}=e;if(u.setTransform(1,0,0,1,0,0),u.globalCompositeOperation="source-over",u.globalAlpha=1,u.clearRect(0,0,d.width,d.height),r<=.002&&l<=.002||!e.maskReady)return;const p=r>.002?oa(e.halo,...la(s),e.haloTint):null,f=l>.002?c==="#ffffff"?e.extra.canvas:oa(e.extra,...la(c),e.extraTint):null,y=M=>{p&&(u.save(),u.translate(t+g,o+g),u.rotate(n),u.globalAlpha=r*M,u.drawImage(p,-e.halo.ax,-e.halo.ay,e.halo.w,e.halo.h),u.restore()),f&&(u.save(),u.translate(a+g,i+g),u.rotate(n),u.globalAlpha=l*M,u.drawImage(f,-e.extra.ax,-e.extra.ay,e.extra.w,e.extra.h),u.restore())};if(!e.pointMode&&e.surroundPath&&e.bandPath){u.save(),u.scale(h,h),u.clip(e.surroundPath,"evenodd"),y(.5),u.restore(),u.save(),u.scale(h,h),u.clip(e.bandPath,"evenodd"),y(1),u.restore();return}u.save(),u.scale(h,h),y(1),u.restore();const w=e.maskAlpha;if(!w)return;const b=u.getImageData(0,0,d.width,d.height),m=b.data;for(let M=0,v=3;M<w.length;M++,v+=4){const O=w[M];if(O!==255){if(O===0){m[v]=0;continue}m[v]=(m[v]*O+127)/255}}u.putImageData(b,0,0)}const st=[255,255,255];function la(e){if(e[0]==="#")return st[0]=parseInt(e.slice(1,3),16),st[1]=parseInt(e.slice(3,5),16),st[2]=parseInt(e.slice(5,7),16),st;let t=4,o=0,n=0;for(;t<e.length&&n<3;){const a=e.charCodeAt(t++);a>=48&&a<=57?o=o*10+(a-48):(a===44||a===41)&&(st[n++]=o,o=0)}return st}function kr(e,t){e.pointMode===t.pointMode&&(t.currentIdx=Math.min(e.currentIdx,Math.max(0,t.perim.length-1)),t.appearedAt=e.appearedAt,t.glowOpacity=e.glowOpacity,t.relocTween=e.relocTween,t.relocNextIdx=e.relocNextIdx,t.relocMul=e.relocMul,t.envClock=e.envClock,t.cursorMode=e.cursorMode,t.cursorArc=e.cursorArc,t.cursorTargetArc=e.cursorTargetArc,t.lastTickMs=e.lastTickMs,t.wanderS=e.wanderS,t.wanderTargetS=e.wanderTargetS,t.wanderFrames=e.wanderFrames,t.tintFrom=e.tintFrom,t.tintTarget=e.tintTarget,t.tintTween=e.tintTween,t.tintHoldUntil=e.tintHoldUntil,t.dEnv=e.relocMul,t.env.style.opacity=e.relocMul.toFixed(3))}const ca=Object.freeze({offsetY:1,blur:.5,alpha:.9,color:"#ffffff"});function Tr(e,t,o){const n=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),a=Math.ceil(3*o.blur+Math.abs(o.offsetY)+1),i=t.width+2*a,r=t.height+2*a,l=document.createElement("canvas");l.className="metal-fx-rim-canvas",l.setAttribute("aria-hidden","true"),l.width=Math.ceil(i*n),l.height=Math.ceil(r*n),l.style.cssText=`position:absolute;left:${-a}px;top:${-a}px;width:${i}px;height:${r}px;pointer-events:none`;const s=l.getContext("2d"),c=document.createElement("canvas");c.width=l.width,c.height=l.height;const u=c.getContext("2d",{willReadFrequently:!0});if(!s||!u)return null;e.appendChild(l);const d={canvas:l,ctx:s,scratch:c,sctx:u,width:t.width,height:t.height,cornerRadius:t.cornerRadius,kind:t.kind,ring:t.ring,margin:a,dpr:n,opts:o,mO:mt(),mI:mt(),sum:Number.NaN};return ja(d,null,!0),d}function ua(e,t,o){const n=t.xy;for(let a=0;a<t.n;a++){const i=n[a*2]+o,r=n[a*2+1]+o;a===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function ja(e,t,o=!1){const{width:n,height:a,cornerRadius:i,ring:r,margin:l,dpr:s}=e;pt(0,0,n,a,i,t,e.mO),pt(r,r,n-2*r,a-2*r,Math.max(0,i-r),t,e.mI);let c=0;const u=e.mO.xy;for(let C=0;C<e.mO.n;C+=4)c+=u[C*2]*1.37+u[C*2+1];if(!o&&c===e.sum)return;e.sum=c;const{sctx:d,scratch:h,ctx:g,canvas:p,opts:f}=e,y=h.width,w=h.height;d.setTransform(1,0,0,1,0,0),d.clearRect(0,0,y,w),d.scale(s,s),d.fillStyle="#fff",d.beginPath(),ua(d,e.mO,l),ua(d,e.mI,l),d.fill("evenodd");const b=d.getImageData(0,0,y,w).data,m=y*w,M=new Float32Array(m);for(let C=0,G=3;C<m;C++,G+=4)M[C]=b[G]/255;const v=Math.round(f.offsetY*s)*y,O=new Float32Array(m);if(v>=0)for(let C=0;C<m;C++)O[C]=Math.max(0,M[C]-(C>=v?M[C-v]:0));else for(let C=0;C<m;C++)O[C]=Math.max(0,M[C]-(C-v<m?M[C-v]:0));const V=Eo(O,y,w,f.blur*s),F=parseInt(f.color.slice(1,3),16),I=parseInt(f.color.slice(3,5),16),Q=parseInt(f.color.slice(5,7),16),L=g.createImageData(y,w),N=L.data;for(let C=0,G=0;C<m;C++,G+=4)N[G]=F,N[G+1]=I,N[G+2]=Q,N[G+3]=Math.round(Math.min(1,V[C]*M[C]*f.alpha)*255);g.setTransform(1,0,0,1,0,0),g.putImageData(L,0,0)}function da(e){e&&e.canvas.remove()}const Nt=12,ha=32,fa=1,ma=.55,Er=1,Ar=1,Br=.85,Or=0,Ir=1.3,pa=3.6,Fr=.7,Pr=1,Lr=.52,Ur=1,Nr=.044,zr=235,Vr=2.535,ga=.7,Dr=.5,Wr=new Set(["INPUT","TEXTAREA","SELECT","OPTION"]);function Gr(e,t){const o=Math.max(e.left-t.right,t.left-e.right,0),n=Math.max(e.top-t.bottom,t.top-e.bottom,0);return Math.sqrt(o*o+n*n)}function Hr(e,t,o,n){return!(Math.min(e.bottom,t.bottom)-Math.max(e.top,t.top)<o||Math.max(e.left-t.right,t.left-e.right,0)>n)}function $r(e,t,o,n){return Math.min(e.right,t.right)-Math.max(e.left,t.left)<o?!1:Math.max(e.top-t.bottom,t.top-e.bottom,0)<=n}function Je(e,t,o,n,a,i){const r=Math.max(0,Math.min(i,n*.5,a*.5)),l=e.roundRect;if(typeof l=="function"){l.call(e,t,o,n,a,r);return}e.moveTo(t+r,o),e.lineTo(t+n-r,o),e.quadraticCurveTo(t+n,o,t+n,o+r),e.lineTo(t+n,o+a-r),e.quadraticCurveTo(t+n,o+a,t+n-r,o+a),e.lineTo(t+r,o+a),e.quadraticCurveTo(t,o+a,t,o+a-r),e.lineTo(t,o+r),e.quadraticCurveTo(t,o,t+r,o)}function Qa(e,t,o,n,a){if(!a.flipX&&!a.flipY){e.drawImage(t,a.sx??0,a.sy??0,o,n,a.x,a.y,a.w,a.h);return}e.save(),a.flipX&&(e.translate(a.x+a.w,0),e.scale(-1,1)),a.flipY&&(e.translate(0,a.y+a.h),e.scale(1,-1)),e.drawImage(t,a.sx??0,a.sy??0,o,n,a.flipX?0:a.x,a.flipY?0:a.y,a.w,a.h),e.restore()}const Xr=4;function Yr(e,t,o,n,a,i,r){if(n<=2*r||a<=2*r){e.beginPath(),Je(e,t,o,n,a,i),e.clip();return}e.beginPath(),Je(e,t,o,n,a,i),Je(e,t+r,o+r,n-2*r,a-2*r,Math.max(0,i-r)),e.clip("evenodd")}function qr(e,t,o,n,a,i,r,l,s,c,u,d){const h=d??Math.max(1,Math.round((Nt+Xr*3)*u));let g=Math.max(0,r),p=!0;for(let f=0;f<3&&g>1e-4;f++){const y=Math.min(1,g);e.save(),Yr(e,c.x,c.y,c.w,c.h,c.r,h),e.globalCompositeOperation=p?"source-over":"lighter",p=!1,e.globalAlpha=y,Qa(e,t,o,n,s),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=l,e.fillRect(0,0,a,i),e.restore(),g-=y}}function Ja(e,t,o,n,a,i,r){const l=r|0;if(l<1||n<=2*l||a<=2*l){e.beginPath(),Je(e,t,o,n,a,i),e.clip();return}e.beginPath(),Je(e,t,o,n,a,i),Je(e,t+l,o+l,n-2*l,a-2*l,Math.max(0,i-l)),e.clip("evenodd")}function jr(e,t,o,n,a,i,r,l,s,c,u,d){let h=l*u,g=!0;for(let p=0;p<3&&h>1e-4;p++){const f=Math.min(1,h);e.save(),Ja(e,r.x,r.y,r.w,r.h,r.r,s),e.globalCompositeOperation=g?"source-over":"lighter",g=!1,e.globalAlpha=f,Qa(e,t,o,n,d),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=c,e.fillRect(0,0,a,i),e.restore(),h-=f}}function Qr(e,t,o,n,a,i,r,l){const s=e.createLinearGradient(n,a,i,r);s.addColorStop(0,`rgba(255,255,255,${l.toFixed(3)})`),s.addColorStop(.5,`rgba(255,255,255,${(l*.45).toFixed(3)})`),s.addColorStop(1,"rgba(255,255,255,0)"),e.save(),Ja(e,t.x,t.y,t.w,t.h,t.r,o),e.globalCompositeOperation="lighter",e.lineWidth=o*2,e.strokeStyle=s,e.beginPath(),Je(e,t.x,t.y,t.w,t.h,t.r),e.stroke(),e.restore()}function Ka(e){const t=getComputedStyle(e),o=[parseFloat(t.borderTopLeftRadius)||0,parseFloat(t.borderTopRightRadius)||0,parseFloat(t.borderBottomRightRadius)||0,parseFloat(t.borderBottomLeftRadius)||0].filter(n=>n>0);return o.length?Math.min.apply(null,o):0}function Za(e){const t=getComputedStyle(e),o=Math.max(parseFloat(t.borderTopWidth)||0,parseFloat(t.borderRightWidth)||0,parseFloat(t.borderBottomWidth)||0,parseFloat(t.borderLeftWidth)||0);let n=0,a=0;const i=t.boxShadow;if(i&&i!=="none"){const l=i.replace(/rgba?\([^)]*\)/g,u=>u.replace(/,/g,"\0")).split(/,\s*/);let s=1/0,c=1/0;for(const u of l){const d=u.match(/-?\d+(?:\.\d+)?px/g);if(!d||d.length<4)continue;const h=parseFloat(d[3]);h>0&&(/\binset\b/.test(u)?h<s&&(s=h):h<c&&(c=h))}Number.isFinite(s)&&(n=s),Number.isFinite(c)&&(a=c)}const r=Math.max(o,a);return{width:Math.max(o,n,a)||1,outerCssPx:r}}function xa(e){e.cornerRadius=Ka(e.el);const t=Za(e.el);e.hairlineWidth=t.width,e.hairlineOuterCssPx=t.outerCssPx}function Jr(e){typeof ResizeObserver<"u"&&(e.resizeObserver=new ResizeObserver(()=>xa(e)),e.resizeObserver.observe(e.el)),typeof MutationObserver<"u"&&(e.mutationObserver=new MutationObserver(()=>xa(e)),e.mutationObserver.observe(e.el,{attributes:!0,attributeFilter:["style","class"]}))}function Kr(e){var t,o;(t=e.resizeObserver)==null||t.disconnect(),e.resizeObserver=null,(o=e.mutationObserver)==null||o.disconnect(),e.mutationObserver=null}const We=new Set,Zr=Object.freeze({enabled:!0,radius:11.5,strength:.57,penumbra:.55,falloff:.21,edgeFade:.7,softness:.24,repaintMs:36}),Ht={...Zr};let ze=null,io=0,va=0,ba=!1;function Bo(){io!==0||typeof requestAnimationFrame>"u"||(io=requestAnimationFrame(e=>{if(io=0,e-va<Ht.repaintMs){Bo();return}va=e,tn()}))}let Dt=!1;function ei(e,t){const o=Ht.radius;for(const n of We){const a=n.anchorEl.getBoundingClientRect(),i=n.el.getBoundingClientRect(),r=Math.min(a.left,i.left)-o,l=Math.max(a.right,i.right)+o,s=Math.min(a.top,i.top)-o,c=Math.max(a.bottom,i.bottom)+o;if(e>=r&&e<=l&&t>=s&&t<=c)return!0}return!1}function wa(e){if(ze={x:e.clientX,y:e.clientY},!Ht.enabled)return;const t=ei(e.clientX,e.clientY);(t||Dt)&&Bo(),Dt=t}function Ut(){ze=null,Dt&&Bo(),Dt=!1}function en(e){typeof document>"u"||e===ba||(ba=e,e?(document.addEventListener("pointermove",wa,{passive:!0}),document.addEventListener("pointerleave",Ut),window.addEventListener("blur",Ut)):(document.removeEventListener("pointermove",wa),document.removeEventListener("pointerleave",Ut),window.removeEventListener("blur",Ut),ze=null))}function ti(e,t,o,n,a,i,r,l,s){if(!ze)return;const c=Ht;if(!c.enabled||c.strength<=0)return;const u=c.radius;let d,h,g,p,f,y;if(a){const T=o.left>=n.right;d=T?n.right:o.right,h=T?o.left:n.left,g=ze.x,p=ze.y,f=Math.max(o.top,n.top),y=Math.min(o.bottom,n.bottom)}else{const T=o.top>=n.bottom;d=T?n.bottom:o.bottom,h=T?o.top:n.top,g=ze.y,p=ze.x,f=Math.max(o.left,n.left),y=Math.min(o.right,n.right)}const w=Math.min(d,h),b=Math.max(d,h),m=Math.max(1,b-w);if(g<w-u||g>b+u||p<f-u||p>y+u)return;const M=Math.max(0,Math.min(1,Math.abs(g-d)/m)),v=Math.max(.5,u*c.edgeFade),O=Math.min(1,Math.min(g-(w-u),b+u-g)/v),V=Math.min(1,Math.min(p-(f-u),y+u-p)/v),F=c.strength*(1-c.falloff*M)*O*V;if(F<=.001)return;const I=u*s*(1+c.penumbra*M),Q=a?(p-n.top+l)*s:(p-n.left+l)*s,L=Math.max(0,Math.min(.5,(1-c.softness)*.5)),N=Math.max(.001,.5-L),C=a?r:i,G=Math.max(0,Math.floor(Q-I)),q=Math.min(C,Math.ceil(Q+I));if(q<=G)return;const Y=new Float32Array(q-G);for(let T=G;T<q;T++){const _=(T+.5-(Q-I))/(2*I),E=_<N?_/N:_>1-N?(1-_)/N:1;Y[T-G]=1-F*Math.max(0,Math.min(1,E))}for(const T of[e,t]){const _=a?0:G,E=a?G:0,Z=a?i:q-G,ee=a?q-G:r,te=T.getImageData(_,E,Z,ee),P=te.data;if(a)for(let B=0;B<ee;B++){const z=Y[B];if(!(z>=.999))for(let D=B*Z*4+3,U=(B+1)*Z*4;D<U;D+=4)P[D]=P[D]*z}else for(let B=0;B<ee;B++)for(let z=0;z<Z;z++){const D=Y[z];if(D>=.999)continue;const U=(B*Z+z)*4+3;P[U]=P[U]*D}T.putImageData(te,_,E)}}let Te=null,ct=null,ut=null,dt=null;function oi(e,t){return Te||(Te=document.createElement("canvas"),ct=document.createElement("canvas"),ut=Te.getContext("2d",{alpha:!0}),dt=ct.getContext("2d",{alpha:!0})),!ut||!dt||!Te||!ct?!1:(Te.width!==e&&(Te.width=e,ct.width=e),Te.height!==t&&(Te.height=t,ct.height=t),ut.setTransform(1,0,0,1,0,0),dt.setTransform(1,0,0,1,0,0),ut.globalCompositeOperation="source-over",dt.globalCompositeOperation="source-over",ut.clearRect(0,0,e,t),dt.clearRect(0,0,e,t),!0)}function ai(e,t,o,n=1){if(typeof document>"u"||Wr.has(e.tagName))return null;for(const p of We)if(p.el===e)return p.strength=n,p;const a=document.createElement("div");a.setAttribute("data-metal-fx-reflection",""),a.setAttribute("aria-hidden","true");const i=document.createElement("canvas");i.className="metal-fx-reflection-canvas";const r=i.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!r)return null;const l=document.createElement("canvas");l.className="metal-fx-reflection-stroke-canvas";const s=l.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!s)return null;a.appendChild(i),a.appendChild(l);const c=getComputedStyle(e);let u=!1;c.position==="static"&&(e.style.position="relative",u=!0);let d=!1;c.isolation!=="isolate"&&(e.style.isolation="isolate",d=!0),e.setAttribute("data-metal-fx-reflect-host",""),e.insertBefore(a,e.firstChild);const h=Za(e),g={el:e,anchor:t,anchorEl:o,strength:n,wrap:a,canvas:i,ctx:r,strokeCanvas:l,strokeCtx:s,cornerRadius:Ka(e),hairlineWidth:h.width,hairlineOuterCssPx:h.outerCssPx,appliedPositionRelative:u,appliedIsolation:d,resizeObserver:null,mutationObserver:null};return Jr(g),We.add(g),en(!0),g}function ni(e){for(const t of We)if(t.el===e){Kr(t),t.canvas.width=0,t.canvas.height=0,t.strokeCanvas.width=0,t.strokeCanvas.height=0,t.wrap.parentNode===t.el&&t.el.removeChild(t.wrap),t.el.removeAttribute("data-metal-fx-reflect-host"),t.appliedPositionRelative&&(t.el.style.position=""),t.appliedIsolation&&(t.el.style.isolation=""),We.delete(t),We.size===0&&en(!1);return}}function ri(e,t,o,n,a){if(n<1||a<1)return null;const i=e.getContext("2d");if(!i)return null;const r=i.getImageData(t,o,n,a).data;let l=n,s=a,c=-1,u=-1;for(let d=0;d<a;d++){const h=d*n;for(let g=0;g<n;g++)r[(h+g)*4+3]>8&&(g<l&&(l=g),g>c&&(c=g),d<s&&(s=d),d>u&&(u=d))}return c<0?null:{x:t+l,y:o+s,w:c-l+1,h:u-s+1}}function tn(){if(We.size===0)return;const e=typeof window<"u"&&window.devicePixelRatio||1,t=new Map;for(const o of We){const n=o.el.getBoundingClientRect();let a=t.get(o.anchorEl);if(a||(a=o.anchorEl.getBoundingClientRect(),t.set(o.anchorEl,a)),n.width<1||n.height<1||a.width<1||a.height<1)continue;const i=o.el.hasAttribute("data-metal-fx-text");if(i&&!o.glyphStyled&&(o.canvas.style.filter="blur(0.4px) saturate(1.35) brightness(1.2)",o.glyphStyled=!0),!Hr(a,n,fa,ha)&&!$r(a,n,fa,ha)){o.canvas.width!==1&&(o.canvas.width=1,o.canvas.height=1),o.strokeCanvas.width!==1&&(o.strokeCanvas.width=1,o.strokeCanvas.height=1);continue}const r=i&&!!o.anchor.mask;r&&!o.anchor.wantRaw&&(o.anchor.wantRaw=!0),o.anchor.wantRing||(o.anchor.wantRing=!0);const l=!!o.anchor.deform&&!!o.anchor.ringCanvas,s=r&&o.anchor.rawCanvas?o.anchor.rawCanvas:l?o.anchor.ringCanvas:o.anchor.canvas,c=Math.round(o.anchor.overscan*e);let u=c,d=c,h=(s.width|0)-2*c,g=(s.height|0)-2*c;if(o.anchor.mask&&!r){const ee=ri(s,u,d,h,g);ee&&(u=ee.x,d=ee.y,h=ee.w,g=ee.h)}if(h<4||g<4)continue;const p=(a.left+a.right)*.5,f=(a.top+a.bottom)*.5,y=(n.left+n.right)*.5,w=(n.top+n.bottom)*.5,b=p-y,m=f-w,M=Math.max(a.left-n.right,n.left-a.right,0),v=Math.max(a.top-n.bottom,n.top-a.bottom,0),O=M>=v,V=Gr(a,n);let F=1-Math.min(1,V/Nt);F=F*F*(3-2*F);const I=ma+(Er-ma)*F,Q=Math.min(pa,I*Ir*Fr)*o.strength,L=a.left>=n.left&&a.right<=n.right&&a.top>=n.top&&a.bottom<=n.bottom?[!0,!1]:[O],N=o.anchor.scale??1,C=Math.max(Pr*N,o.hairlineWidth),G=Math.max(1,Math.round(C*e)),q=Math.max(1,Math.round(Math.max(Ur*N,o.hairlineWidth)*e)),Y=o.hairlineOuterCssPx;o.wrap.style.inset=`${-Y}px`,o.wrap.style.borderRadius=`${Math.max(0,o.cornerRadius)}px`;const T=Math.max(1,Math.round((n.width+Y*2)*e)),_=Math.max(1,Math.round((n.height+Y*2)*e));o.canvas.width!==T&&(o.canvas.width=T),o.canvas.height!==_&&(o.canvas.height=_),o.strokeCanvas.width!==T&&(o.strokeCanvas.width=T),o.strokeCanvas.height!==_&&(o.strokeCanvas.height=_);const E=o.ctx;E.setTransform(1,0,0,1,0,0),E.clearRect(0,0,T,_);const Z=o.strokeCtx;Z.setTransform(1,0,0,1,0,0),Z.clearRect(0,0,T,_);for(const[ee,te]of L.entries()){const P=ee>0&&oi(T,_),B=P?ut:E,z=P?dt:Z,D=Math.min((i?Nt*1.5:Nt)*e,Math.max(T,_));let U,ie,he,me;te?(U=b>0?T:0,he=b>0?T-D:D,ie=_*.5,me=_*.5):(ie=m>0?_:0,me=m>0?_-D:D,U=T*.5,he=T*.5);const fe=E.createLinearGradient(U,ie,he,me);fe.addColorStop(0,`rgba(0,0,0,${Ar})`),fe.addColorStop(.5,`rgba(0,0,0,${Br})`),fe.addColorStop(1,`rgba(0,0,0,${Or})`);const ge=h/e,le=i?Math.max(1,Math.min(te?T:_,Math.round(te?h:g))):Math.max(1,Math.round(zr*Math.max(.1,ge/140)*e));let ce,A,X,H,re=!1,ye=!1;if(te){const W=Math.max(a.top,n.top),j=Math.min(a.bottom,n.bottom);re=!0,ce=b>0?T-le:0,A=Math.round((W-n.top+Y)*e),X=le,H=Math.max(1,Math.round((j-W)*e))}else{const W=Math.max(a.left,n.left),j=Math.min(a.right,n.right);ye=!0,ce=Math.round((W-n.left+Y)*e),A=m>0?_-le:0,X=Math.max(1,Math.round((j-W)*e)),H=le}const xe={x:ce,y:A,w:X,h:H,flipX:re,flipY:ye,sx:u,sy:d},pe={x:0,y:0,w:T,h:_,r:Math.max(0,o.cornerRadius*e)},k=i?Math.min(1,Q*ga):Math.min(pa,Q*Vr*ga*Dr);qr(B,s,h,g,T,_,k,fe,xe,pe,e,i?Math.max(T,_):void 0),i||(jr(z,s,h,g,T,_,pe,Q,G,fe,Lr,xe),Qr(z,pe,q,U,ie,he,me,Math.min(.85,Nr*Q))),P&&(E.globalCompositeOperation="lighter",E.drawImage(Te,0,0),Z.globalCompositeOperation="lighter",Z.drawImage(ct,0,0))}for(const ee of L)ti(E,Z,a,n,ee,T,_,Y,e);E.globalCompositeOperation="source-over",Z.globalCompositeOperation="source-over"}}let so=!1,ya=0;function ii(){so||(so=!0,!(typeof requestAnimationFrame>"u")&&requestAnimationFrame(e=>{so=!1,!(e-ya<ln)&&(ya=e,tn())}))}const Ma="metal-fx-styles",si=`
.metal-fx-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  overflow: visible;
  background: #272727;
  color: #f8f8f8;
}
.metal-fx-root[data-theme='light'] {
  background: #ffffff;
  color: #1d1d1d;
}

.metal-fx-root::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  box-shadow: inset 0 0 50px 0 rgba(255, 255, 255, 0.02);
}
.metal-fx-root[data-theme='light']::before {
  box-shadow: inset 0 0 50px 0 rgba(0, 0, 0, 0.02);
}

.metal-fx-root::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light']::after {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
/* Circle variant gets a thicker outer rim than the button variant. */
.metal-fx-root[data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light'][data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.metal-fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* The inner spacer — defines the inset geometry where the metal ring meets
   the interior (3 px for Button, 1-2 px for Circle) and carries the Circle dark
   hairline ('box-shadow: inset' rules below). Intentionally transparent so
   the wrapper's background propagates through to the punched shader centre,
   giving consumers a single surface tone to override. See "Single-surface
   background" in the file header for the rationale. */
.metal-fx-inner {
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  z-index: 1;
  pointer-events: none;
}

.metal-fx-root[data-variant='button'][data-shape='pill'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 20px) - 3px);
}
.metal-fx-root[data-variant='button'][data-shape='circle'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 16px) - 3px);
}
.metal-fx-root[data-variant='circle'][data-shape='pill'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 20px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
.metal-fx-root[data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 16px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
/* Circle-variant hairline alpha — light mode.
   Source-of-truth: index.html L2261-2267. The 0.45-alpha black inset that
   reads as a single-pixel frame against the dark interior is too heavy
   on a #ffffff inner: it ends up looking like a hard 2-px black ring
   against the iridescent shader. Suppressed entirely (alpha 0) — the
   shader's own iridescent rim already defines the silhouette in light
   mode, so an extra dark hairline only competes with it. The rule is
   kept (rather than deleted) as a tunable hook in case a future variant
   wants to re-introduce a soft edge. NOTE: we keep the dark-mode inset
   and border-radius values because — unlike index.html — our renderer
   does NOT overscan the canvas in light mode, so there is no 1-px gap
   between inner element and shader to compensate for. */
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='pill'] .metal-fx-inner,
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0);
}

/* ─── Combined glow SVG (z=3) ──────────────────────────────────────────────
   Single SVG per instance that holds BOTH the wide-halo group
   (#mfx_haloTravel) and the catch-light group (#mfx_extraTravel), exactly
   mirroring canonical's _buildGlowSvgInner (index.html L8078). One
   mix-blend-mode: screen lifts the combined composite onto the shader
   ring; per-frame opacity attributes on each inner group still drive the
   independent fade-in / fade-out cycles for the halo and the catch-light.

   Why a single SVG: the circle variant anchors halo + catch-light at the same
   perimeter point, so they overlap in the bright zone. Two separately-
   screened SVGs would double-screen the overlap (A + B + C - AB - AC -
   BC + ABC instead of A + B + C - AB - AC once both groups composite
   in source-over inside one SVG and then screen against the host once).
   That overlap looked muted versus canonical specifically on the circle
   variant where both layers travel together.

   Source-of-truth opacity: #btnGlowSvg drops to 0.7 in dark and 0.2746 in
   light (index.html L632/L643). */
.metal-fx-glow-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}
.metal-fx-root[data-theme='light'] .metal-fx-glow-svg {
  /* Light-mode 1-px overscan mirrors .btn-glow-svg in metal.html so the
     halo stays glued to the visible silhouette (the shader ring there sits
     1 px outside the host's padding box). */
  inset: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  mix-blend-mode: multiply;
  /* Source-of-truth: html[data-theme="light"] #btnGlowSvg { opacity: 0.2746 }
     → −35 % from 0.4225 from the original 0.7 dark-mode opacity. */
  opacity: 0.2746;
  filter: saturate(5.355) brightness(0.78);
}
/* Circle light-mode small variants (e.g. 36×36 send button): the geometrically
   shrunk halo loses density when multiplied against #ffffff. Mirror the
   canonical override at index.html L2316 — bump saturation + drop brightness
   so the small glow holds together visually. */
.metal-fx-root[data-variant='circle'][data-shape='circle'][data-theme='light'] .metal-fx-glow-svg {
  filter: saturate(7.5) brightness(0.6);
}

/* The wrapped child — hoisted into z=5 so it sits above every overlay, with
   normalized chrome so consumer button styles don't fight the metal frame. */
.metal-fx-content {
  position: relative;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}
.metal-fx-content > * {
  pointer-events: auto;
}
.metal-fx-root[data-normalize='true'] .metal-fx-content > * {
  background: transparent !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  /* Sizing: we deliberately DO NOT force \`width: 100%; height: 100%\` on the
     child here. That used to be the contract ("the wrapper is the visible
     button surface; the child stretches to fill it"), but it created a cyclic
     percentage dependency: the wrapper is \`inline-flex\` with no intrinsic
     size, .metal-fx-content is \`width/height: 100%\` of the wrapper, and the
     child was \`100%\` of .metal-fx-content. With nothing breaking the cycle,
     icon-only / class-sized children collapsed.

     The new contract: the child sizes itself (intrinsic content, CSS class,
     or inline style — all work), and the wrapper's \`inline-flex\` wraps it
     tightly. Consumers who want a metal frame BIGGER than the child (e.g.
     padding around an icon) size <MetalFx style={{ width, height }}> AND
     explicitly set width/height on the child to fill (or accept that the
     child renders at its intrinsic size, centered).

     Typography is intentionally NOT touched. We used to apply
     \`color: inherit; font: inherit;\` here to "match" the wrapper, but
     \`font: inherit\` is a shorthand that overrides font-family, font-size,
     font-weight, AND line-height on the child — which (a) shrank the
     button height (line-height changes propagate through the flex
     content box) and (b) scaled em-based icons / font-icons inside the
     child to whatever the wrapper inherited. The wrapper now stays out
     of the child's typography entirely; consumers who want typographic
     normalization can apply it themselves on the child element. */
}

[data-metal-fx-reflection] {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
  isolation: isolate;
}
.metal-fx-reflection-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: blur(4px) saturate(1.2) brightness(1.58);
}
.metal-fx-reflection-stroke-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: saturate(1.35) brightness(1.75);
}
/* Hosts that participate as reflection targets need positioning + isolation
   so the wrap composites only against the host (not the parent stack). The
   wrap injects these inline as well, but stating them here keeps reflections
   working on hosts that already have other inline styles applied. */
[data-metal-fx-reflect-host] {
  isolation: isolate;
}
`;let lo=!1;function li(){if(lo||typeof document>"u")return;if(document.getElementById(Ma)){lo=!0;return}const e=document.createElement("style");e.id=Ma,e.textContent=si,document.head.appendChild(e),lo=!0}li();const ci={position:"absolute",inset:0,width:"100%",height:"100%"},ui={position:"absolute",inset:3},di={position:"absolute",inset:0,pointerEvents:"none",zIndex:3,borderRadius:"inherit"},hi={position:"absolute",inset:0,pointerEvents:"none",zIndex:4},Ct=new Map;function fi(){const e=globalThis;e.__MFX_DEBUG__&&(e.__mfxGlow=Ct)}Vn((e,t)=>{const o=Ct.get(e);return o?Cr(o.handles,e,t,e.opacityMul*e.glowGain,o.themeRef.current):!1});function mi(e){const[t,o]=K.useState(()=>e!=="auto"?e:typeof window>"u"||!window.matchMedia||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");return K.useEffect(()=>{if(e!=="auto"){o(e);return}if(typeof window>"u"||!window.matchMedia)return;const n=window.matchMedia("(prefers-color-scheme: dark)"),a=()=>o(n.matches?"dark":"light");return a(),n.addEventListener("change",a),()=>n.removeEventListener("change",a)},[e]),t}const on=K.forwardRef(function({children:e,variant:t="button",preset:o="chromatic",theme:n="auto",strength:a=1,glowGain:i=1,paused:r=!1,borderRadius:l,normalizeHostStyles:s=!0,reflectionTargets:c,disableGlow:u=!1,innerShadow:d,shaderScale:h,ringCssPx:g,scale:p=1,mask:f,glowMode:y="mask",className:w,style:b,...m},M){const v=K.useRef(null),O=K.useRef(null),V=K.useRef(null),F=K.useRef(null),I=K.useRef(null),Q=K.useRef(null),L=K.useRef(null),N=K.useRef(null),C=K.useRef("dark"),G=K.useRef(0),[q,Y]=K.useState(!1),T=mi(n),_=K.useMemo(()=>Sn(),[]);C.current=T;const E=t==="circle"?"circle":"pill",Z=!u;K.useImperativeHandle(M,()=>v.current,[]);const ee=(P,B)=>{if(E==="circle")return Math.min(P,B)/2;const z=typeof l=="number"?l:(()=>{var D;const U=(D=Q.current)==null?void 0:D.firstElementChild;if(U){const ie=parseFloat(getComputedStyle(U).borderTopLeftRadius);if(Number.isFinite(ie)&&ie>0)return ie}return G.current})();return Math.min(z,Math.min(P,B)/2)};K.useEffect(()=>{_&&zn(o,T)},[o,T,_]),K.useEffect(()=>{const P=L.current;P&&it(P,{mask:f??null})},[f]),K.useEffect(()=>{const P=L.current;P&&it(P,{paused:r})},[r]),K.useEffect(()=>{const P=L.current;if(!P)return;const B={};h!==void 0&&(B.shaderScale=h),g!==void 0&&(B.ringCssPx=g),p!==void 0&&(B.scale=p),Object.keys(B).length>0&&it(P,B)},[h,g,p]),K.useLayoutEffect(()=>{const P=O.current,B=v.current,z=V.current;if(!P||!B||!_)return;{const k=getComputedStyle(B),W=parseFloat(k.borderTopLeftRadius);G.current=Number.isFinite(W)?W:0}const D=()=>{const k=B.getBoundingClientRect(),W=Math.max(1,Math.round(k.width)),j=Math.max(1,Math.round(k.height));return{cssWidth:W,cssHeight:j,cornerRadius:ee(W,j)}},U=D();L.current=On({onComposite:()=>{const k=L.current,W=N.current;k&&W&&Rr(W,k.deform);const j=I.current;k&&j&&ja(j,k.deform)},hostCanvas:P,cssWidth:U.cssWidth,cssHeight:U.cssHeight,cornerRadius:U.cornerRadius,kind:E,paused:r,shaderScale:h,ringCssPx:g,scale:p,mask:f??null,onFirstCopy:()=>Y(!0)}),B.style.setProperty("--mfx-radius",`${U.cornerRadius}px`),B.style.borderRadius=`${U.cornerRadius}px`;const ie=(k,W)=>{if(!f||y==="ring")return{};const j=window.devicePixelRatio||1,se=document.createElement("canvas");se.width=Math.max(1,Math.round(k*j)),se.height=Math.max(1,Math.round(W*j));const Ze=se.getContext("2d");if(!Ze)return{};Ze.fillStyle="#fff",f(Ze,se.width,se.height,j);const et=Ze.getImageData(0,0,se.width,se.height).data,Et=[],Oe=Math.max(1,Math.round(2*j));for(let tt=Oe>>1;tt<se.height;tt+=Oe)for(let Re=Oe>>1;Re<se.width;Re+=Oe)et[(tt*se.width+Re)*4+3]>128&&Et.push({x:Re/j,y:tt/j});return{samplePoints:Et,maskDataUrl:se.toDataURL("image/png")}};z&&(N.current=sa(z,{width:U.cssWidth,height:U.cssHeight,cornerRadius:U.cornerRadius,kind:E,scale:p,...ie(U.cssWidth,U.cssHeight)}));const he=k=>{if(!z)return;const W=N.current;z.innerHTML="",N.current=sa(z,{width:k.cssWidth,height:k.cssHeight,cornerRadius:k.cornerRadius,kind:E,scale:p,...ie(k.cssWidth,k.cssHeight)}),W&&kr(W,N.current);const j=L.current;j&&N.current&&Ct.set(j,{handles:N.current,themeRef:C})},me=()=>d?d===!0?ca:{...ca,...d}:null,fe=k=>{const W=F.current,j=L.current;da(I.current),I.current=null;const se=me();!W||!j||!se||(I.current=Tr(W,{width:k.cssWidth,height:k.cssHeight,cornerRadius:k.cornerRadius,kind:E,ring:j.ringCssPx},se))};fe(U);let ge=0,le=U.cssWidth,ce=U.cssHeight,A=U.cornerRadius;const X=new ResizeObserver(()=>{ge===0&&(ge=requestAnimationFrame(()=>{ge=0;const k=D(),W=L.current;!W||Math.abs(k.cssWidth-le)<.5&&Math.abs(k.cssHeight-ce)<.5&&Math.abs(k.cornerRadius-A)<.5||(le=k.cssWidth,ce=k.cssHeight,A=k.cornerRadius,it(W,{cssWidth:k.cssWidth,cssHeight:k.cssHeight,cornerRadius:k.cornerRadius}),B.style.setProperty("--mfx-radius",`${k.cornerRadius}px`),B.style.borderRadius=`${k.cornerRadius}px`,he(k),fe(k))}))});X.observe(B);let H=null;const re=()=>{const k=L.current;if(k&&Un(k)){const W=D();he(W),fe(W)}ye()},ye=()=>{H==null||H.removeEventListener("change",re),H=typeof window.matchMedia=="function"?window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`):null,H==null||H.addEventListener("change",re)};ye();const xe=Xn(k=>{k&&L.current&&he(D())});let pe=null;return typeof IntersectionObserver<"u"&&(pe=new IntersectionObserver(k=>{const W=L.current;if(W)for(const j of k)Ln(W,j.isIntersecting)},{rootMargin:"64px"}),pe.observe(B)),L.current&&N.current&&(Ct.set(L.current,{handles:N.current,themeRef:C}),Fn(L.current)),qn(),fi(),()=>{jn(),da(I.current),I.current=null,X.disconnect(),H==null||H.removeEventListener("change",re),pe==null||pe.disconnect(),xe(),ge!==0&&cancelAnimationFrame(ge);const k=L.current;k&&(Ct.delete(k),Pn(k),In(k)),L.current=null,N.current=null,z&&(z.innerHTML="")}},[E]),K.useEffect(()=>{const P=L.current;P&&it(P,{opacityMul:Math.max(0,Math.min(1,a)),glowGain:Math.max(0,i)})},[a,i,t]),K.useEffect(()=>{const P=L.current,B=v.current;if(!P||!B||!c||T!=="dark")return;P.onAfterFrame=ii;const z=c.flatMap(D=>{const U="current"in D?D:D.ref,ie="current"in D?1:D.strength??1;return U.current?[{el:U.current,strength:ie}]:[]});for(const{el:D,strength:U}of z)ai(D,P,B,U);return()=>{P.onAfterFrame=void 0;for(const{el:D}of z)ni(D)}},[c,T]),K.useEffect(()=>{const P=v.current,B=L.current;if(!P||!B)return;const z=ee(B.cssWidth,B.cssHeight);it(B,{cornerRadius:z}),P.style.setProperty("--mfx-radius",`${z}px`),P.style.borderRadius=`${z}px`},[l,T,t,E]);const te=K.useMemo(()=>({...b,"--mfx-strength":String(Math.min(1,Math.max(0,a))),opacity:q?1:0,visibility:q?"visible":"hidden",transition:q?"opacity 0.15s ease-out":"none"}),[b,a,q]);return _?Ne.jsxs("div",{...m,ref:v,className:w?`metal-fx-root ${w}`:"metal-fx-root","data-variant":t,"data-shape":E,"data-theme":T,"data-paused":r?"true":void 0,"data-normalize":s?"true":"false",style:te,children:[Ne.jsx("canvas",{ref:O,className:"metal-fx-canvas",style:ci}),Ne.jsx("div",{className:"metal-fx-inner","aria-hidden":"true",style:ui}),Ne.jsx("div",{ref:V,"aria-hidden":"true",style:{...di,display:Z?void 0:"none"}}),d?Ne.jsx("div",{ref:F,"aria-hidden":"true",style:hi}):null,Ne.jsx("div",{ref:Q,className:"metal-fx-content",children:e})]}):Ne.jsx("div",{...m,ref:v,className:w?`metal-fx-fallback ${w}`:"metal-fx-fallback","data-metal-fx-unsupported":"",style:{display:"inline-flex",...b},children:e})});on.displayName="MetalFx";const an=Object.freeze({enabled:!0,applyTo:"ring",strength:.74,fadeInMs:200,fadeOutMs:350,smoothMs:140,reach:36,blob:13,liquidBlob:10,maxDisp:9,gain:.6,pressGain:.55,pullGain:.49,press:5,liquid:7.5,liquidReach:8,liquidStiffness:53,liquidDamping:9,stiffness:260,damping:13,mass:1,follow:.32,mapRes:2,smooth:.25}),pi={...an};function gi(e,t=()=>pi){K.useEffect(()=>{const o=e.current;if(!o||typeof document>"u")return;const n=o.querySelector("canvas.metal-fx-canvas"),a=o.querySelector(".metal-fx-inner");let i=null,r=null,l=!1,s=!1,c=0,u=0,d=0,h=0,g=0,p=0,f=0,y=0,w=0,b=0,m=0,M=0,v=0,O=0,V=0,F=0,I=0,Q=0,L=NaN,N=NaN,C=NaN,G=NaN,q=NaN,Y=0,T=0,_=0,E=1,Z=1;const ee=($,R,J)=>{const de=$-c,ue=R-u,ve=de*de+ue*ue,_e=Math.exp(-ve/E),Ie=Math.exp(-ve/Z);J.x=Y*_e+de*_*Ie,J.y=T*_e+ue*_*Ie},te={x:0,y:0},P=($,R,J)=>{ee($,R,te),J.x=$+te.x,J.y=R+te.y},B="mfx-bend-style";if(!document.getElementById(B)){const $=document.createElement("style");$.id=B,$.textContent=".metal-fx-root[data-mfx-bend]::before,.metal-fx-root[data-mfx-bend]::after{box-shadow:none!important}",document.head.appendChild($)}let z=!1,D=null;const U=o.style.background,ie=(a==null?void 0:a.style.visibility)??"",he=$=>{if(!$||$==="none")return null;const R=$.match(/^(rgba?\([^)]*\)|#[0-9a-fA-F]+|[a-z]+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/);return R?{color:R[1],spread:Math.abs(parseFloat(R[5]))}:null},me=$=>{if(z||!n)return;const R=he(getComputedStyle(o,"::after").boxShadow),J=a?he(getComputedStyle(a).boxShadow):null,de=a&&parseFloat(getComputedStyle(a).inset)||0;D={fill:getComputedStyle(o).backgroundColor,rim:R&&R.spread>0?{inset:0,width:R.spread,color:R.color}:null,hairline:J&&J.spread>0?{inset:de,width:J.spread,color:J.color}:null},o.style.background="transparent",o.setAttribute("data-mfx-bend",""),a&&(a.style.visibility="hidden"),Qo(n,P,D,$),z=!0},fe=()=>{!z||!n||(Qo(n,null,null,0),o.style.background=U,o.removeAttribute("data-mfx-bend"),a&&(a.style.visibility=ie),z=!1)},ge=`mfx-bend-${Math.random().toString(36).slice(2,8)}`,le="http://www.w3.org/2000/svg",ce=.75,A=document.createElementNS(le,"svg");A.setAttribute("aria-hidden","true"),A.style.cssText="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";const X=document.createElementNS(le,"filter");X.setAttribute("id",ge),X.setAttribute("x",`-${ce*100}%`),X.setAttribute("y",`-${ce*100}%`),X.setAttribute("width",`${(1+2*ce)*100}%`),X.setAttribute("height",`${(1+2*ce)*100}%`),X.setAttribute("color-interpolation-filters","sRGB");const H=document.createElementNS(le,"feFlood");H.setAttribute("flood-color","rgb(128,128,0)"),H.setAttribute("flood-opacity","1"),H.setAttribute("result","neutral");const re=document.createElementNS(le,"feImage");re.setAttribute("result","img"),re.setAttribute("preserveAspectRatio","none");const ye=document.createElementNS(le,"feComposite");ye.setAttribute("in","img"),ye.setAttribute("in2","neutral"),ye.setAttribute("operator","over"),ye.setAttribute("result","map");const xe=document.createElementNS(le,"feDisplacementMap");xe.setAttribute("in","SourceGraphic"),xe.setAttribute("in2","map"),xe.setAttribute("xChannelSelector","R"),xe.setAttribute("yChannelSelector","G"),xe.setAttribute("result","bent");const pe=document.createElementNS(le,"feGaussianBlur");pe.setAttribute("in","bent"),pe.setAttribute("stdDeviation","0");for(const $ of[H,re,ye,xe,pe])X.appendChild($);A.appendChild(X),document.body.appendChild(A);const k=document.createElement("canvas"),W=k.getContext("2d",{alpha:!1,willReadFrequently:!0});let j=null,se=null;const Ze=4278222976;let et=!1;const Et=o.style.filter,Oe=()=>{et&&(o.style.filter=Et,et=!1)},tt=($,R,J,de)=>{if(!W)return;const ue=Math.max(.25,$.mapRes),ve=-R*ce,_e=-J*ce,Ie=R*(1+2*ce),Ce=J*(1+2*ce),be=Math.max(2,Math.round(Ie*ue)),Fe=Math.max(2,Math.round(Ce*ue));(k.width!==be||k.height!==Fe||!j||!se)&&(k.width=be,k.height=Fe,j=W.createImageData(be,Fe),se=new Uint32Array(j.data.buffer)),se.fill(Ze);const ot=j.data,Pe=3*Math.max($.blob,$.liquidBlob),Ot=Math.max(0,Math.floor((c-Pe-ve)*ue)),xt=Math.min(be-1,Math.ceil((c+Pe-ve)*ue)),$t=Math.max(0,Math.floor((u-Pe-_e)*ue)),Xt=Math.min(Fe-1,Math.ceil((u+Pe-_e)*ue)),It=255/de;for(let Le=$t;Le<=Xt;Le++){const vt=_e+(Le+.5)/ue;let Ge=(Le*be+Ot)*4;for(let at=Ot;at<=xt;at++,Ge+=4){const Ft=ve+(at+.5)/ue;ee(Ft,vt,te);let Se=127.5-te.x*It;Se=Se<0?0:Se>255?255:Se;let He=127.5-te.y*It;He=He<0?0:He>255?255:He,ot[Ge]=Se,ot[Ge+1]=He}}W.putImageData(j,0,0),re.setAttribute("x",ve.toFixed(2)),re.setAttribute("y",_e.toFixed(2)),re.setAttribute("width",Ie.toFixed(2)),re.setAttribute("height",Ce.toFixed(2)),re.setAttribute("href",k.toDataURL("image/png")),xe.setAttribute("scale",de.toFixed(2)),pe.setAttribute("stdDeviation",Math.max(0,$.smooth).toFixed(3)),et||(o.style.filter=`url(#${ge})`,et=!0)},Re=()=>{F===0&&(I=performance.now(),F=requestAnimationFrame(Oo))},Oo=$=>{F=0;const R=t(),J=Math.min(.032,Math.max(.001,($-I)/1e3));I=$;const de=o.getBoundingClientRect(),ue=de.width,ve=de.height,_e=ue/2,Ie=ve/2;let Ce=0,be=0;if(M=0,R.enabled&&i){const $e=i.x-de.left,Yt=i.y-de.top,Po=$e-_e,Lo=Yt-Ie,Ue=Math.hypot(Po,Lo),Uo=Math.min(ue,ve)/2,No=Math.max(ue,ve)/2+R.reach,rn=s;s=Ue<No;const qt=Math.max(0,1-Math.abs(Ue-Uo)/Math.max(1,R.liquidReach));if(M=qt*qt*(3-2*qt),s){rn||(c=$e,u=Yt);const zo=1-Math.pow(1-Math.min(.999,R.follow),J*60);c+=($e-c)*zo,u+=(Yt-u)*zo;const Vo=1-Math.max(0,(Ue-(No-R.reach))/R.reach);Ce=O*(R.gain/100)*Vo,be=V*(R.gain/100)*Vo;const Do=Ue>.001?Po/Ue:0,Wo=Ue>.001?Lo/Ue:0,jt=Uo-Ue;if(jt>0){const bt=jt*R.pressGain;Ce-=Do*bt,be-=Wo*bt}else{const bt=-jt,Jt=Math.max(0,1-bt/Math.max(1,R.reach)),Go=bt*R.pullGain*(Jt*Jt*(3-2*Jt));Ce+=Do*Go,be+=Wo*Go}const Qt=Math.hypot(Ce,be);Qt>R.maxDisp&&(Ce*=R.maxDisp/Qt,be*=R.maxDisp/Qt)}}else s=!1;O*=Math.exp(-J*12),V*=Math.exp(-J*12);const Fe=1-Math.exp(-(J*1e3)/Math.max(1,R.smoothMs));w+=(Ce-w)*Fe,b+=(be-b)*Fe;const ot=Math.max(.05,R.mass);g+=(-R.stiffness*(d-w)-R.damping*g)/ot*J,p+=(-R.stiffness*(h-b)-R.damping*p)/ot*J,d+=g*J,h+=p*J;const Pe=l&&s&&R.enabled?R.press:0,Ot=s&&R.enabled?R.liquid*(M+(l?.5:0)):0;m+=(Ot-m)*Fe,y+=(-R.liquidStiffness*(f-m)-R.liquidDamping*y)/ot*J,f+=y*J;const xt=s&&R.enabled?1:0,$t=Math.max(1,xt?R.fadeInMs:R.fadeOutMs)/3;v+=(xt-v)*(1-Math.exp(-(J*1e3)/$t)),v<.002&&xt===0&&(v=0);const Xt=Math.hypot(d,h),It=!s&&v===0&&Xt<.05&&Math.hypot(g,p)<1&&Math.abs(f)<.05&&Pe===0;if(R.applyTo==="ring"?Oe():fe(),It){d=h=g=p=f=y=0,w=b=m=0,L=N=C=G=q=NaN,fe(),Oe();return}const Le=Math.max(0,R.strength)*v;let vt=_e-c,Ge=Ie-u;const at=Math.hypot(vt,Ge)||1;vt/=at,Ge/=at;const Ft=Math.max(.5,R.blob),Se=Math.max(.5,R.liquidBlob);E=2*Ft*Ft,Z=2*Se*Se,Y=(d+vt*Pe)*Le,T=(h+Ge*Pe)*Le,_=f/Se*Le;const He=!(Math.abs(d-L)<.05&&Math.abs(h-N)<.05&&Math.abs(f-C)<.05&&Math.abs(c-G)<.05&&Math.abs(u-q)<.05),nn=$-Q>=1e3/60-.5;if(He&&nn)if(Q=$,L=d,N=h,C=f,G=c,q=u,R.applyTo==="ring"&&n){const $e=Math.ceil((R.maxDisp+R.liquid*1.5)*Math.max(1,R.strength))+4;me($e),Nn(n)}else{const $e=Math.max(1,(R.maxDisp+R.liquid*1.5)*2*Math.max(1,R.strength));tt(R,ue,ve,$e)}else R.applyTo==="ring"&&n&&!z&&me(Math.ceil((R.maxDisp+R.liquid*1.5)*Math.max(1,R.strength))+4);F=requestAnimationFrame(Oo)},Io=$=>{const R=performance.now();if(r){const J=Math.max(.004,(R-r.t)/1e3),de=1-Math.exp(-J/.04);O+=(($.clientX-r.x)/J-O)*de,V+=(($.clientY-r.y)/J-V)*de}r={x:$.clientX,y:$.clientY,t:R},i={x:$.clientX,y:$.clientY},Re()},At=()=>{i=null,r=null,Re()},Fo=()=>{l=!0,Re()},Bt=()=>{l=!1,Re()};return document.addEventListener("pointermove",Io,{passive:!0}),document.addEventListener("pointerleave",At),window.addEventListener("blur",At),o.addEventListener("pointerdown",Fo),document.addEventListener("pointerup",Bt),document.addEventListener("pointercancel",Bt),()=>{F!==0&&cancelAnimationFrame(F),document.removeEventListener("pointermove",Io),document.removeEventListener("pointerleave",At),window.removeEventListener("blur",At),o.removeEventListener("pointerdown",Fo),document.removeEventListener("pointerup",Bt),document.removeEventListener("pointercancel",Bt),fe(),Oe(),A.parentNode&&A.parentNode.removeChild(A)}},[e,t])}function vi({children:e,paused:t}){const o=K.useRef(null),n=K.useRef(t);n.current=t;const a=K.useCallback(()=>({...an,enabled:!n.current,applyTo:"ring",maxDisp:5,strength:.65}),[]);return gi(o,a),Ne.jsx(on,{ref:o,preset:"silver",theme:"dark",strength:.95,innerShadow:{alpha:.55,blur:.6},ringCssPx:1.6,shaderScale:1.35,disableGlow:!0,normalizeHostStyles:!1,paused:t,children:e})}export{vi as default};
