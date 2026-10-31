import{r as q,j as xe}from"./index-DEjBwA9b.js";function ss(e){let t=e.replace("#","");return t.length===3&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255]}function po(e){let t=e.replace("#","");(t.length===3||t.length===4)&&(t=t.split("").map(n=>n+n).join(""));const a=t.length>=8?parseInt(t.slice(6,8),16)/255:1;return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255,a]}function on(e,t,a){e/=255,t/=255,a/=255;const n=Math.max(e,t,a),o=Math.min(e,t,a),i=n-o;let r=0;const l=n===0?0:i/n;return i!==0&&(n===e?r=((t-a)/i+6)%6:n===t?r=(a-e)/i+2:r=(e-t)/i+4,r/=6),[r,l,n]}function nn(e,t,a){const n=Math.floor(e*6),o=e*6-n,i=a*(1-t),r=a*(1-o*t),l=a*(1-(1-o)*t);let s=0,c=0,u=0;switch(n%6){case 0:s=a,c=l,u=i;break;case 1:s=r,c=a,u=i;break;case 2:s=i,c=a,u=l;break;case 3:s=i,c=r,u=a;break;case 4:s=l,c=i,u=a;break;case 5:s=a,c=i,u=r;break}return[Math.round(s*255),Math.round(c*255),Math.round(u*255)]}const $n=66,Vn=66,Gn=1500,Wn=1,go=16,Hn=96,Xn=2,Yn=0,ls=1,cs=2,us=3,ds=4,hs=0,qn=1,fs=2,Mt={colorBack:"#00000000",speed:1,repetition:1.5,softness:.05,shiftRed:.3,shiftBlue:.3,distortion:.1,contour:.4,angle:90,shape:Yn,scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,fit:qn},jn={name:"chromatic",modes:{dark:{...Mt,colorTint:"#88ccff2e",shiftRed:.75,shiftBlue:.75,repetition:2,softness:.09,shaderOpacity:1},light:{...Mt,colorTint:"#66b0ff99",shiftRed:.6,shiftBlue:.6,shaderOpacity:1}}},Qn={name:"silver",modes:{dark:{...Mt,colorTint:"#ffffff66",shaderOpacity:.88},light:{...Mt,colorTint:"#ffffff40",shaderOpacity:1}}},Jn={name:"gold",modes:{dark:{...Mt,colorTint:"#ffcc55cc",speed:.85,shaderOpacity:.92},light:{...Mt,colorTint:"#f7d488aa",shaderOpacity:1}}},rn={chromatic:jn,silver:Qn,gold:Jn},Kn=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,Zn=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,er=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,tr=`
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
`,ar=`#version 300 es
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

${Kn}
${Zn}
${tr}

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

  ${er}

  fragColor = vec4(color, opacity);
}
`,or=`#version 300 es
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
}`,nr=ar;function xo(e,t,a){const n=e.createShader(t);if(!n)throw new Error("metal-fx: gl.createShader returned null");if(e.shaderSource(n,a),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const o=e.getShaderInfoLog(n);throw e.deleteShader(n),new Error(`metal-fx: shader compile failed: ${o??"(no info log)"}`)}return n}function rr(e,t,a){const n=e.createProgram();if(!n)throw new Error("metal-fx: gl.createProgram returned null");if(e.attachShader(n,t),e.attachShader(n,a),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){const o=e.getProgramInfoLog(n);throw e.deleteProgram(n),new Error(`metal-fx: program link failed: ${o??"(no info log)"}`)}return n}const sn=140,ln=40,cn=1.6,un=1.3;let x=null,dt=null;function ir(){var e;if(dt!==null)return dt;if(typeof document>"u")return dt=!1;try{const t=document.createElement("canvas").getContext("webgl2");dt=!!t,(e=t==null?void 0:t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{dt=!1}return dt}let Aa=null;function sr(e){Aa=e}const lr=["u_resolution","u_time","u_pixelRatio","u_colorBack","u_colorTint","u_repetition","u_softness","u_shiftRed","u_shiftBlue","u_distortion","u_contour","u_angle","u_shape","u_isImage","u_image","u_originX","u_originY","u_worldWidth","u_worldHeight","u_fit","u_scale","u_rotation","u_offsetX","u_offsetY","u_imageAspectRatio"];function vo(e){e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);const t=xo(e,e.VERTEX_SHADER,or),a=xo(e,e.FRAGMENT_SHADER,nr),n=rr(e,t,a);e.useProgram(n);const o=e.createBuffer();if(!o)throw new Error("metal-fx: gl.createBuffer returned null");e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const i=e.getAttribLocation(n,"a_position");e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);const r={};for(const s of lr)r[s]=e.getUniformLocation(n,s);const l=e.createTexture();return l&&(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,l),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r.u_image&&e.uniform1i(r.u_image,0)),{program:n,buffer:o,uniforms:r,dummyTexture:l}}function Ya(){if(x)return x;const e=Math.min(Xn,typeof window<"u"&&window.devicePixelRatio||1),t=Math.round(Hn*e),a=typeof OffscreenCanvas<"u";let n,o;if(a)n=new OffscreenCanvas(t,t),o=n.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});else{const d=document.createElement("canvas");d.width=t,d.height=t,o=d.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,preserveDrawingBuffer:!0}),n=d}if(!o)throw new Error("metal-fx: WebGL2 not supported");const{program:i,buffer:r,uniforms:l,dummyTexture:s}=vo(o),c=d=>{d.preventDefault(),x&&(x.contextLost=!0)},u=()=>{if(!x)return;const d=vo(x.gl);x.program=d.program,x.buffer=d.buffer,x.uniforms=d.uniforms,x.dummyTexture=d.dummyTexture,x.presetDirty=!0,x.contextLost=!1,Aa==null||Aa()};return n.addEventListener("webglcontextlost",c,!1),n.addEventListener("webglcontextrestored",u,!1),x={glCanvas:n,gl:o,program:i,buffer:r,uniforms:l,dummyTexture:s,preset:rn.chromatic.modes.dark,presetDirty:!0,contextLost:!1,useOffscreen:a,frameBitmap:null,startMs:performance.now(),pausedMs:0,pausedAtMs:null,rafId:0,dpr:e,instances:new Set,frameCount:0,glowQueue:[],glowIdx:0,glowSkip:0,glowPixels:new Uint8Array(t*t*4),glowPixelsW:t,glowPixelsH:t},x}function cr(){var e;if(!x)return;const{gl:t,program:a,buffer:n,frameBitmap:o,dummyTexture:i}=x;try{o==null||o.close(),t.deleteBuffer(n),t.deleteProgram(a),i&&t.deleteTexture(i),(e=t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{}x=null}let wo=0;function ur(){if(!x)return;const e=performance.now();if(e-wo<Gn)return;wo=e;const{gl:t,glCanvas:a}=x,n=a.width,o=a.height;(x.glowPixelsW!==n||x.glowPixelsH!==o)&&(x.glowPixelsW=n,x.glowPixelsH=o,x.glowPixels=new Uint8Array(n*o*4)),t.readPixels(0,0,n,o,t.RGBA,t.UNSIGNED_BYTE,x.glowPixels)}const ht={bx:0,by:0};function ra(e,t,a){if(!x)return ht.bx=0,ht.by=0,ht;const{glCanvas:n}=x,o=n.width,i=n.height,r=e.dpr,l=e.cssWidth*r,s=e.cssHeight*r,c=sn*r,u=ln*r;let d=l*(o/c)/e.shaderScale,h=s*(i/u)/e.shaderScale;d>o&&(d=o),h>i&&(h=i);const m=(o-d)/2,g=(i-h)/2,p=m+t/e.cssWidth*d,y=g+a/e.cssHeight*h;return ht.bx=Math.round(p),ht.by=Math.round(i-1-y),ht}const Re={r:0,g:0,b:0,lum:0,count:0};function dn(e,t,a,n,o,i){const r=Math.max(1,i|0),l=Math.max(0,n-r),s=Math.min(t,n+r+1),c=Math.max(0,o-r),u=Math.min(a,o+r+1);Re.r=0,Re.g=0,Re.b=0,Re.lum=0,Re.count=0;for(let d=c;d<u;d++){const h=d*t;for(let m=l;m<s;m++){const g=(h+m)*4;Re.r+=e[g],Re.g+=e[g+1],Re.b+=e[g+2],Re.lum+=(.2126*e[g]+.7152*e[g+1]+.0722*e[g+2])/255,Re.count++}}return Re}const ce={r:255,g:255,b:255};function Oa(e,t,a,n){if(!x)return 0;const o=ra(e,t,a),i=dn(x.glowPixels,x.glowPixelsW,x.glowPixelsH,o.bx,o.by,n);return i.count>0?i.lum/i.count:0}function hn(e,t,a,n){if(!x)return ce.r=255,ce.g=255,ce.b=255,ce;const o=ra(e,t,a),i=dn(x.glowPixels,x.glowPixelsW,x.glowPixelsH,o.bx,o.by,n);return i.count===0?(ce.r=255,ce.g=255,ce.b=255,ce):(ce.r=i.r/i.count,ce.g=i.g/i.count,ce.b=i.b/i.count,ce)}function dr(e,t,a,n){if(!x)return ce.r=255,ce.g=255,ce.b=255,ce;const o=ra(e,t,a),{glowPixels:i,glowPixelsW:r,glowPixelsH:l}=x,s=Math.max(1,n|0),c=Math.max(0,o.bx-s),u=Math.min(r,o.bx+s+1),d=Math.max(0,o.by-s),h=Math.min(l,o.by+s+1);let m=-1;ce.r=255,ce.g=255,ce.b=255;for(let g=d;g<h;g++){const p=g*r;for(let y=c;y<u;y++){const b=(p+y)*4,v=i[b],f=i[b+1],M=i[b+2],w=Math.max(v,f,M),O=Math.min(v,f,M),L=(w>0?(w-O)/w:0)*(.35+.65*(w/255));L>m&&(m=L,ce.r=v,ce.g=f,ce.b=M)}}return ce}const Ce={r:255,g:255,b:255,lum:0};function hr(e,t,a,n){if(Ce.r=255,Ce.g=255,Ce.b=255,Ce.lum=0,!x)return Ce;const o=ra(e,t,a),{glowPixels:i,glowPixelsW:r,glowPixelsH:l}=x,s=Math.max(1,n|0),c=Math.max(0,o.bx-s),u=Math.min(r,o.bx+s+1),d=Math.max(0,o.by-s),h=Math.min(l,o.by+s+1);for(let m=d;m<h;m++){const g=m*r;for(let p=c;p<u;p++){const y=(g+p)*4,b=(.2126*i[y]+.7152*i[y+1]+.0722*i[y+2])/255;b>Ce.lum&&(Ce.lum=b,Ce.r=i[y],Ce.g=i[y+1],Ce.b=i[y+2])}}return Ce}const va=14,bo=1.5,wa={x:0,y:0};function _t(e=512){return{xy:new Float32Array(e*2),n:0}}function St(e,t,a,n,o,i,r=_t()){o=Math.max(0,Math.min(o,Math.min(a,n)/2));const l=4*(va+1)+Math.ceil(2*(a+n)/bo)+8;r.xy.length<l*2&&(r.xy=new Float32Array(l*2));const s=r.xy;let c=0;const u=(m,g)=>{i?(i(m,g,wa),s[c*2]=wa.x,s[c*2+1]=wa.y):(s[c*2]=m,s[c*2+1]=g),c++},d=(m,g,p,y)=>{const b=Math.hypot(p-m,y-g),v=Math.max(1,Math.ceil(b/bo));for(let f=0;f<v;f++){const M=f/v;u(m+(p-m)*M,g+(y-g)*M)}},h=(m,g,p,y)=>{for(let b=0;b<=va;b++){const v=p+(y-p)*(b/va);u(m+o*Math.cos(v),g+o*Math.sin(v))}};return d(e+o,t,e+a-o,t),h(e+a-o,t+o,-Math.PI/2,0),d(e+a,t+o,e+a,t+n-o),h(e+a-o,t+n-o,0,Math.PI/2),d(e+a-o,t+n,e+o,t+n),h(e+o,t+n-o,Math.PI/2,Math.PI),d(e,t+n-o,e,t+o),h(e+o,t+o,Math.PI,1.5*Math.PI),r.n=c,r}sr(()=>{x&&x.instances.size>0&&x.pausedAtMs===null&&Ct()});typeof document<"u"&&document.addEventListener("visibilitychange",()=>{!x||x.pausedAtMs!==null||x.contextLost||(document.hidden?qa():x.instances.size>0&&Ct())});function fr(e){const t=Ya(),a=e.hostCanvas.getContext("2d",{alpha:!0});if(!a)throw new Error("metal-fx: canvas 2D context unavailable");const n=e.scale??1,o={canvas:e.hostCanvas,ctx:a,cssWidth:e.cssWidth,cssHeight:e.cssHeight,cornerRadius:e.cornerRadius,kind:e.kind,ringCssPx:e.ringCssPx??(e.kind==="circle"?2:1)*n,shaderScale:e.shaderScale??(e.kind==="circle"?un:cn)*n,opacityMul:e.opacityMul??1,glowGain:e.glowGain??1,visible:!0,paused:e.paused??!1,everCopied:!1,frozen:null,dpr:typeof window<"u"&&window.devicePixelRatio||1,scale:n,onAfterFrame:e.onAfterFrame,onComposite:e.onComposite,onFirstCopy:e.onFirstCopy,mask:e.mask??null,deform:null,deformLayers:null,overscan:0,cursorLight:null,glowFast:!1,rawCanvas:null,wantRaw:!1,ringCanvas:null,wantRing:!1};return ia(o),t.instances.add(o),t.rafId===0&&t.pausedAtMs===null&&Ct(),o}function mr(e){if(!x)return;x.instances.delete(e);const t=x.glowQueue.indexOf(e);t!==-1&&x.glowQueue.splice(t,1),x.instances.size===0&&(qa(),cr())}function pr(e){x&&(x.glowQueue.includes(e)||x.glowQueue.push(e))}function gr(e){if(!x)return;const t=x.glowQueue.indexOf(e);t!==-1&&x.glowQueue.splice(t,1)}function ft(e,t){let a=!1;t.mask!==void 0&&(e.mask=t.mask),t.cssWidth!==void 0&&t.cssWidth!==e.cssWidth&&(e.cssWidth=t.cssWidth,a=!0),t.cssHeight!==void 0&&t.cssHeight!==e.cssHeight&&(e.cssHeight=t.cssHeight,a=!0),t.cornerRadius!==void 0&&(e.cornerRadius=t.cornerRadius),t.scale!==void 0&&(e.scale=t.scale),t.kind!==void 0&&t.kind!==e.kind&&(e.kind=t.kind,t.shaderScale===void 0&&(e.shaderScale=(t.kind==="circle"?un:cn)*e.scale),t.ringCssPx===void 0&&(e.ringCssPx=(t.kind==="circle"?2:1)*e.scale)),t.shaderScale!==void 0&&(e.shaderScale=t.shaderScale),t.ringCssPx!==void 0&&(e.ringCssPx=t.ringCssPx),t.opacityMul!==void 0&&(e.opacityMul=t.opacityMul),t.glowGain!==void 0&&(e.glowGain=t.glowGain),t.paused!==void 0&&t.paused!==e.paused&&(e.paused=t.paused,t.paused?pn(e):e.frozen=null,!t.paused&&x&&x.rafId===0&&x.pausedAtMs===null&&!x.contextLost&&Ct()),a&&ia(e)}function xr(e,t){e.visible=t,t&&x&&x.rafId===0&&x.pausedAtMs===null&&!x.contextLost&&Ct()}function yo(e,t,a=null,n=0){const o=fn(e);if(!o)return!1;o.deform=t,o.deformLayers=t?a:null;const i=t?Math.max(0,Math.round(n)):0;return i!==o.overscan&&(o.overscan=i,ia(o)),sa(o),!0}function vr(e){return(typeof window<"u"&&window.devicePixelRatio||1)===e.dpr?!1:(ia(e),sa(e),!0)}function wr(e){const t=fn(e);t&&sa(t)}function fn(e){if(!x)return null;for(const t of x.instances)if(t.canvas===e)return t;return null}let mn=null;function br(e,t){const a=Ya();a.preset=mn??rn[e].modes[t],a.presetDirty=!0}function ms(e){const t=Ya();mn=e,e&&(t.preset=e,t.presetDirty=!0)}function ps(){return x?{...x.preset}:null}function gs(){!x||x.pausedAtMs!==null||(x.pausedAtMs=performance.now(),qa())}function xs(){!x||x.pausedAtMs===null||(x.pausedMs+=performance.now()-x.pausedAtMs,x.pausedAtMs=null,x.instances.size>0&&Ct())}let ot=null;function yr(e){ot=e}function ba(e,t){!ot||!x||!e.visible||e.paused||x.glowQueue.includes(e)&&(e.glowFast=!!ot(e,t))}function ia(e){e.dpr=typeof window<"u"&&window.devicePixelRatio||1;const t=e.overscan,a=Math.max(1,Math.round((e.cssWidth+2*t)*e.dpr)),n=Math.max(1,Math.round((e.cssHeight+2*t)*e.dpr));e.canvas.width!==a&&(e.canvas.width=a),e.canvas.height!==n&&(e.canvas.height=n);const o=e.canvas.style;t>0?(o.left=`${-t}px`,o.top=`${-t}px`,o.width=`calc(100% + ${2*t}px)`,o.height=`calc(100% + ${2*t}px)`,o.borderRadius="0"):o.left!==""&&(o.left="",o.top="",o.width="100%",o.height="100%",o.borderRadius="")}function Mr(e){const{ctx:t,dpr:a,canvas:n}=e,o=e.ringCssPx*a,i=n.width,r=n.height,l=Math.max(0,(e.cornerRadius-e.ringCssPx)*a);t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.beginPath(),t.roundRect(o,o,i-2*o,r-2*o,l),t.fill(),t.restore()}const _r=_t();function et(e,t,a,n,o,i,r,l){const{xy:s,n:c}=St(t,a,n,o,i,r,_r);e.beginPath();for(let u=0;u<c;u++)u===0?e.moveTo(s[0]*l,s[1]*l):e.lineTo(s[u*2]*l,s[u*2+1]*l);e.closePath()}function pn(e){if(!x)return null;const t=x.frameBitmap??x.glCanvas,a=x.glCanvas.width,n=x.glCanvas.height;if(a<1||n<1)return null;let o=e.frozen;o||(o=document.createElement("canvas"),e.frozen=o),(o.width!==a||o.height!==n)&&(o.width=a,o.height=n);const i=o.getContext("2d");return i?(i.clearRect(0,0,a,n),i.drawImage(t,0,0),o):(e.frozen=null,null)}function sa(e){var t,a;if(!x)return;const n=(e.paused?e.frozen??pn(e):null)??x.frameBitmap??x.glCanvas,o=e.dpr,i=e.canvas.width,r=e.canvas.height;if(i<1||r<1)return;const l=Math.max(1,Math.round(e.cssWidth*o)),s=Math.max(1,Math.round(e.cssHeight*o)),c=e.overscan*o,u=n.width,d=n.height,h=sn*o,m=ln*o;let g=l*(u/h)/e.shaderScale,p=s*(d/m)/e.shaderScale;g>u&&(g=u),p>d&&(p=d);const y=Math.max(0,(u-g)/2),b=Math.max(0,(d-p)/2),v=e.opacityMul*x.preset.shaderOpacity,f=e.ctx;f.clearRect(0,0,i,r);const M=e.deform;if(e.mask){if(v<1&&(f.globalAlpha=v),f.drawImage(n,y,b,g,p,0,0,i,r),v<1&&(f.globalAlpha=1),e.wantRaw){let w=e.rawCanvas;w||(w=document.createElement("canvas"),e.rawCanvas=w),(w.width!==i||w.height!==r)&&(w.width=i,w.height=r);const O=w.getContext("2d");O&&(O.clearRect(0,0,i,r),O.drawImage(e.canvas,0,0))}f.save(),f.globalCompositeOperation="destination-in",f.fillStyle="#000",e.mask(f,i,r,o),f.restore(),f.globalCompositeOperation="source-over"}else if(!M)v<1&&(f.globalAlpha=v),f.drawImage(n,y,b,g,p,0,0,i,r),v<1&&(f.globalAlpha=1),Mr(e);else{const w=e.cssWidth,O=e.cssHeight,L=e.cornerRadius,I=e.ringCssPx,B=e.deformLayers;f.save(),f.translate(c,c);const Q=l/g,U=s/p,$=Math.min(u,g*(l+2*c)/l),R=Math.min(d,p*(s+2*c)/s),V=Math.max(0,(u-$)/2),J=Math.max(0,(d-R)/2),Y=$*Q,T=R*U;if(v<1&&(f.globalAlpha=v),f.drawImage(n,V,J,$,R,l/2-Y/2,s/2-T/2,Y,T),v<1&&(f.globalAlpha=1),f.globalCompositeOperation="destination-in",et(f,0,0,w,O,L,M,o),f.fillStyle="#000",f.fill(),f.globalCompositeOperation="destination-out",et(f,I,I,w-2*I,O-2*I,Math.max(0,L-I),M,o),f.fill(),e.wantRing){let _=e.ringCanvas;_||(_=document.createElement("canvas"),e.ringCanvas=_),(_.width!==i||_.height!==r)&&(_.width=i,_.height=r);const k=_.getContext("2d");k&&(k.setTransform(1,0,0,1,0,0),k.globalCompositeOperation="source-over",k.clearRect(0,0,i,r),k.translate(c,c),v<1&&(k.globalAlpha=v),k.drawImage(n,V,J,$,R,l/2-Y/2,s/2-T/2,Y,T),k.globalAlpha=1,k.globalCompositeOperation="destination-out",et(k,I,I,w-2*I,O-2*I,Math.max(0,L-I),M,o),k.fillStyle="#000",k.fill(),k.globalCompositeOperation="source-over",k.setTransform(1,0,0,1,0,0))}if(B!=null&&B.hairline){const _=B.hairline;f.globalCompositeOperation="destination-over",et(f,_.inset,_.inset,w-2*_.inset,O-2*_.inset,Math.max(0,L-_.inset),M,o),f.lineWidth=_.width*o,f.strokeStyle=_.color,f.stroke()}if(B!=null&&B.fill&&(f.globalCompositeOperation="destination-over",et(f,0,0,w,O,L,M,o),f.fillStyle=B.fill,f.fill()),B!=null&&B.rim){const _=B.rim;f.globalCompositeOperation="source-over",f.save(),et(f,0,0,w,O,L,M,o),f.clip();const k=_.inset+_.width/2;et(f,k,k,w-2*k,O-2*k,Math.max(0,L-k),M,o),f.lineWidth=_.width*o,f.strokeStyle=_.color,f.stroke(),f.restore()}f.restore(),f.globalCompositeOperation="source-over"}if((t=e.onComposite)==null||t.call(e),e.onFirstCopy){const w=e.onFirstCopy;e.onFirstCopy=void 0,w()}(a=e.onAfterFrame)==null||a.call(e)}function Sr(){if(!x)return;const{gl:e,uniforms:t,preset:a,glCanvas:n,dpr:o}=x;t.u_resolution&&e.uniform2f(t.u_resolution,n.width,n.height),t.u_pixelRatio&&e.uniform1f(t.u_pixelRatio,o),t.u_colorBack&&e.uniform4fv(t.u_colorBack,po(a.colorBack)),t.u_colorTint&&e.uniform4fv(t.u_colorTint,po(a.colorTint)),t.u_repetition&&e.uniform1f(t.u_repetition,a.repetition),t.u_softness&&e.uniform1f(t.u_softness,a.softness),t.u_shiftRed&&e.uniform1f(t.u_shiftRed,a.shiftRed),t.u_shiftBlue&&e.uniform1f(t.u_shiftBlue,a.shiftBlue),t.u_distortion&&e.uniform1f(t.u_distortion,a.distortion),t.u_contour&&e.uniform1f(t.u_contour,a.contour),t.u_angle&&e.uniform1f(t.u_angle,a.angle),t.u_shape&&e.uniform1f(t.u_shape,a.shape),t.u_isImage&&e.uniform1i(t.u_isImage,0),t.u_imageAspectRatio&&e.uniform1f(t.u_imageAspectRatio,1),t.u_originX&&e.uniform1f(t.u_originX,a.originX),t.u_originY&&e.uniform1f(t.u_originY,a.originY),t.u_worldWidth&&e.uniform1f(t.u_worldWidth,a.worldWidth),t.u_worldHeight&&e.uniform1f(t.u_worldHeight,a.worldHeight),t.u_fit&&e.uniform1f(t.u_fit,a.fit),t.u_scale&&e.uniform1f(t.u_scale,a.scale),t.u_rotation&&e.uniform1f(t.u_rotation,a.rotation),t.u_offsetX&&e.uniform1f(t.u_offsetX,a.offsetX),t.u_offsetY&&e.uniform1f(t.u_offsetY,a.offsetY),x.presetDirty=!1}function Rr(e){if(!x)return;const{gl:t,uniforms:a,preset:n,glCanvas:o}=x,i=(e-x.startMs-x.pausedMs)/1e3*n.speed;t.viewport(0,0,o.width,o.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),x.presetDirty&&Sr(),a.u_time&&t.uniform1f(a.u_time,i),t.drawArrays(t.TRIANGLES,0,6),x.frameCount++}let Mo=0;function gn(e){var t;if(!x)return;if(x.contextLost){x.rafId=0;return}let a=!1;for(const n of x.instances)if(n.visible&&(!n.paused||!n.everCopied)){a=!0;break}if(!a){x.rafId=0;return}if(x.rafId=requestAnimationFrame(gn),e-Mo<$n){if(ot)for(const n of x.glowQueue)n.glowFast&&n.visible&&!n.paused&&(n.glowFast=!!ot(n,e));return}Mo=e,Rr(e),ur(),x.useOffscreen&&((t=x.frameBitmap)==null||t.close(),x.frameBitmap=x.glCanvas.transferToImageBitmap());for(const n of x.instances)n.visible&&(n.paused&&n.everCopied||(sa(n),n.everCopied=!0));if(ot&&x.glowQueue.length>0&&++x.glowSkip%Wn===0)for(const n of x.glowQueue)n.visible&&!n.paused&&(n.glowFast=!!ot(n,e))}function Ct(){!x||x.rafId!==0||(x.rafId=requestAnimationFrame(gn))}function qa(){x&&(x.rafId!==0&&cancelAnimationFrame(x.rafId),x.rafId=0)}const Ba={linear:e=>e,smoothstep:e=>e*e*(3-2*e)};function At(e,t,a,n=Ba.linear){return{from:e,to:t,dur:a,ease:n,startMs:-1,val:e,done:!1}}function Ot(e,t){e.startMs=t,e.val=e.from,e.done=!1}function _o(e,t){if(e.done||e.startMs<0)return e.val;const a=Math.min(1,(t-e.startMs)/e.dur);return e.val=e.from+(e.to-e.from)*e.ease(a),a>=1&&(e.done=!0),e.val}const Cr=new Set(["haloHalfLen","extraHalfLen","haloStrokeXl","haloStrokeLg","haloStrokeMd","haloStrokeSm","haloBlurXl","haloBlurLg","haloBlurMd","haloBlurSm","haloOpXl","haloOpLg","haloOpMd","haloOpSm","extraStrokeOuter","extraStrokeCore","extraBlurOuter","extraBlurCore","extraFadeR","extraOpOuter"]),xn=Object.freeze({haloOpMul:2,extraIntensity:3.51,peakOp:.85,baseOp:.34,inset:1.5,extraOutward:1,wanderRange:15,wanderLerp:.0075,fadeRate:.00875,lumLo:.08,lumHi:.32,minDwellMs:1500,relocFadeMs:300,relocFadeOutMs:450,pointGain:2.5,haloHalfLen:7.8,extraHalfLen:9.13952/3,haloStrokeXl:26.4,haloStrokeLg:15.6,haloStrokeMd:7.2,haloStrokeSm:3,haloBlurXl:8.4,haloBlurLg:4.8,haloBlurMd:2.1,haloBlurSm:.9,haloOpXl:.385,haloOpLg:.595,haloOpMd:.7,haloOpSm:.7,extraStrokeOuter:4/3,extraStrokeCore:2/3,extraBlurOuter:2/3,extraBlurCore:1.35/3,extraFadeR:13/3,extraOpOuter:.85}),C={...xn},Ia=new Set;function kr(e){let t=!1;for(const a of Object.keys(e)){const n=e[a];n===void 0||C[a]===n||(C[a]=n,Cr.has(a)&&(t=!0))}for(const a of Ia)a(t)}function vs(){kr({...xn})}function Tr(e){return Ia.add(e),()=>{Ia.delete(e)}}const vn=Object.freeze({enabled:!0,reach:56,fadeMs:200,cursor:!0,cursorDistance:186,cursorStrength:3.35,cursorDiffuse:1.4,cursorFalloff:37,cursorDepth:.4,cursorEdge:0,cursorReach:11.5,cursorBlur:.5,cursorZoom:3,spill:!1,spillRadius:48,spillStrength:.55,spillOffset:.35,spillLumGain:.7,spillSaturation:1.3,spillInside:.5,spillBlur:0,catchLight:!1,catchFollow:.25,catchGain:1}),He={...vn};function Er(e){Object.assign(He,e),!He.spill&&Ee&&ta(),He.cursor||Pe(),la()}function ws(){Er({...vn})}let je=null,yt=null,Fa=0;function Ar(){const e=window.devicePixelRatio||1;return Fa>0?Fa/e:1}function wn(e,t){if(!_e||!je)return;const a=Ar(),n=(e-je.hotX*a).toFixed(2),o=(t-je.hotY*a).toFixed(2);_e.style.transform=a===1?`translate3d(${n}px,${o}px,0)`:`translate3d(${n}px,${o}px,0) scale(${a.toFixed(4)})`}let ja=!1,Qa=0,It=0,wt=null;const Xe={x:0,y:0};let Ft=null,So=0;function Or(e,t,a,n,o){if(Ft&&So===a&&Ft.length===n*o)return Ft;const i=document.createElement("canvas");i.width=n,i.height=o;const r=i.getContext("2d",{willReadFrequently:!0});if(!r)return null;r.scale(a,a),r.drawImage(e,0,0,t.width,t.height);const l=r.getImageData(0,0,n,o).data,s=new Uint8ClampedArray(n*o);for(let c=0,u=3;c<s.length;c++,u+=4)s[c]=l[u]>=128?255:0;return Ft=s,So=a,s}function Ro(e,t,a,n){const o=e.getImageData(0,0,t,a),i=o.data;for(let r=0,l=0,s=3;r<a;r++)for(let c=0;c<t;c++,l++,s+=4){const u=i[s];if(u===0)continue;const d=n(c,r,l);i[s]=d>=1?u:d<=0?0:u*d}e.putImageData(o,0,0)}function Br(e,t){const a=document.createElement("canvas");a.width=Math.ceil(t.width*2),a.height=Math.ceil(t.height*2);const n=a.getContext("2d",{willReadFrequently:!0});if(!n)return;n.drawImage(e,0,0,a.width,a.height);const o=n.getImageData(0,0,a.width,a.height).data,i=[];let r=0,l=0,s=0;for(let h=0;h<a.height;h++)for(let m=0;m<a.width;m++){if(o[(h*a.width+m)*4+3]<128)continue;const g=(m+.5)/2,p=(h+.5)/2;i.push(g,p),r+=g,l+=p,s++}if(s===0)return;Xe.x=t.centerX??r/s,Xe.y=t.centerY??l/s;const c=new Float32Array(i.length);for(let h=0;h<i.length;h+=2)c[h]=i[h]-Xe.x,c[h+1]=i[h+1]-Xe.y;wt=c;const u=document.createElement("canvas");u.width=a.width,u.height=a.height;const d=u.getContext("2d");if(d){const h=d.createImageData(a.width,a.height);for(let m=3;m<o.length;m+=4)o[m]>=128&&(h.data[m-3]=255,h.data[m-2]=255,h.data[m-1]=255,h.data[m]=255);d.putImageData(h,0,0)}}function Ir(e,t){if(!wt)return 0;let a=-1/0;for(let n=0;n<wt.length;n+=2){const o=wt[n]*e+wt[n+1]*t;o>a&&(a=o)}return a===-1/0?0:a}function bs(e){if(je=e,yt=null,wt=null,Ft=null,ja=!1,Qa=0,It=0,Fa=(typeof window<"u"&&window.devicePixelRatio||1)>=1.5?2:1,Pe(),!e||typeof Image>"u")return;const t=new Image;t.decoding="async",t.onload=()=>{je===e&&(Br(t,e),yt=t,la())},t.src=e.src}let Ut=0,Rt=!1,nt=0,La=0,Te=Number.NaN,Ye=Number.NaN,Dt=0,$t=0,tt=0,at=0,ie=null;const X={d:0,nx:0,ny:0,k:1,left:0,top:0},ya={x:0,y:0},Ie={r:255,g:255,b:255};let Ee=null,Pa="",Ua=-1,Na=-1,Vt=!1;function Fr(){Ut++,Pr()}function Lr(){Ut=Math.max(0,Ut-1),Ut===0&&Ur()}const Lt=e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches;function Co(){if(ja||performance.now()<Qa||!je||!yt||Lt("(prefers-reduced-motion: reduce)")||Lt("(forced-colors: active)")||!Lt("(pointer: fine)")||!Lt("(hover: hover)"))return!1;const e=window.visualViewport;return!(e&&Math.abs(e.scale-1)>.001)}function Pr(){Rt||Ut===0||typeof document>"u"||Lt("(pointer: fine)")&&(Rt=!0,document.addEventListener("pointermove",bn,{passive:!0}),document.addEventListener("pointerleave",qe),document.addEventListener("pointercancel",qe),document.addEventListener("keydown",yn,{passive:!0}),document.addEventListener("visibilitychange",qe),window.addEventListener("blur",qe))}function Ur(){Rt&&(Rt=!1,document.removeEventListener("pointermove",bn),document.removeEventListener("pointerleave",qe),document.removeEventListener("pointercancel",qe),document.removeEventListener("keydown",yn),document.removeEventListener("visibilitychange",qe),window.removeEventListener("blur",qe),nt!==0&&(cancelAnimationFrame(nt),nt=0),ie&&(ie.cursorLight=null,ie=null),tt=0,at=0,Ee&&(Ee.remove(),Ee=null,Pa="",Ua=-1,Na=-1,Vt=!1),Pe(),_e&&(_e.remove(),_e=null))}let za=!0,Ja=!1;function bn(e){za=e.pointerType==="mouse"||e.pointerType==="",Ja=!1,Te=Dt=e.clientX,Ye=$t=e.clientY,Gt&&_e&&(za&&Mn(Te,Ye)?wn(Te,Ye):Pe()),la()}function yn(){Ja=!0,Pe()}function qe(){Te=Ye=Number.NaN,la()}function la(){!Rt||nt!==0||(La=performance.now(),nt=requestAnimationFrame(_n))}function Nr(e,t,a,n,o,i,r){const l=i==="circle"?Math.min(a,n)/2:Math.max(0,Math.min(o,Math.min(a,n)/2)),s=a/2,c=n/2,u=Math.max(0,a/2-l),d=Math.max(0,n/2-l),h=Math.max(-u,Math.min(u,e-s)),m=Math.max(-d,Math.min(d,t-c)),g=e-s-h,p=t-c-m,y=Math.hypot(g,p);if(y>1e-6)return r.x=s+h+g/y*l,r.y=c+m+p/y*l,y-l;const b=e,v=a-e,f=t,M=n-t,w=Math.min(b,v,f,M);return w===b?(r.x=0,r.y=t):w===v?(r.x=a,r.y=t):w===f?(r.x=e,r.y=0):(r.x=e,r.y=n),-w}let _e=null,Ge=null,Da=null,ge=null,Pt=null,ko=!1,To=0,Eo=0,Ao=0,Gt=!1,bt=!1,$a="",Le=null,Nt="";const zr=/^(INPUT|TEXTAREA|SELECT)$/;let Va=new WeakMap,Oo=0,Ga=null;function Dr(e){let t=e;for(;t&&t!==document.body;){if(zr.test(t.tagName)||t.isContentEditable)return!0;t=t.parentElement}return!1}function $r(){if(_e)return!0;const e=document.createElement("div");e.className="metal-fx-cursor",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483001;will-change:transform;transform-origin:0 0;display:none";const t=document.createElement("canvas");t.style.display="block",e.appendChild(t),document.body.appendChild(e);const a=t.getContext("2d"),n=document.createElement("canvas"),o=n.getContext("2d");return!a||!o?(e.remove(),!1):(_e=e,Ge=t,Da=a,ge=n,Pt=o,!0)}function Mn(e,t,a=!1){const n=performance.now();if(!a&&bt&&n-Oo<12)return!0;Oo=n;const o=document.elementFromPoint(e,t);if(!o)return Wa(),!1;if(o===Ga&&bt)return!0;Ga=o;let i=Va.get(o);if(i===void 0){if(i=!Dr(o),i){const r=getComputedStyle(o).cursor;i=r==="auto"||r==="default"||r==="none"}Va.set(o,i)}if(!i)return Wa(),!1;if(!bt){const r=document.documentElement;$a=r.style.cursor,r.style.cursor="none",bt=!0}return o!==Le&&(Le&&(Le.style.cursor=Nt,Le=null,Nt=""),getComputedStyle(o).cursor!=="none"&&(Le=o,Nt=o.style.cursor,o.style.cursor="none")),!0}function Wa(){Le&&(Le.isConnected&&(Le.style.cursor=Nt),Le=null,Nt=""),bt&&(document.documentElement.style.cursor=$a,bt=!1,$a=""),Ga=null,Va=new WeakMap}function Pe(){Wa(),_e&&Gt&&(_e.style.display="none",Gt=!1)}function Vr(e,t,a){if(!Da||!Pt||!Ge||!ge||!_e||!je||!yt)return;const n=je,o=Math.min(3,window.devicePixelRatio||1);if((o!==To||n.width!==Eo||n.height!==Ao)&&(To=o,Eo=n.width,Ao=n.height,Ge.width=ge.width=Math.ceil(n.width*o),Ge.height=ge.height=Math.ceil(n.height*o),Ge.style.width=`${n.width}px`,Ge.style.height=`${n.height}px`),!ko&&(Pt=ge.getContext("2d",{willReadFrequently:!0}),ko=!0,!Pt))return;const i=Da,r=Pt,l=n.width,s=n.height;i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,Ge.width,Ge.height),i.scale(o,o),i.drawImage(yt,0,0,l,s);const c=X.left+X.nx*X.k,u=X.top+X.ny*X.k,d=Dt-n.hotX+Xe.x,h=$t-n.hotY+Xe.y,m=c-d,g=u-h,p=Math.hypot(m,g),y=p>.01?m/p:1,b=p>.01?g/p:0,v=Ir(y,b)+t.cursorEdge,f=Math.max(0,p-v),M=Math.max(1,t.cursorFalloff),w=1/(1+f/M*(f/M)),O=e.cssWidth/2,L=e.cssHeight/2,I=O-X.nx,B=L-X.ny,Q=Math.hypot(I,B)||1,U=e.mask?0:e.ringCssPx*.5+1,$=X.nx+I/Q*U,R=X.ny+B/Q*U,V=hr(e,$,R,4),J=V.lum,Y=V.r,T=V.g,_=V.b,k=t.cursorStrength*w*a,ae=t.cursorDiffuse*w*(.5+.5*Math.min(1,J/.5))*a;if(p>.01&&k+ae>.005){const K=m/p,ee=g/p,P=Math.atan2(ee,K),F=Math.max(.1,Math.min(1,t.cursorDepth)),N=Xe.x+v*K,z=Xe.y+v*ee,D=Math.max(1,t.cursorReach);if(r.setTransform(1,0,0,1,0,0),r.clearRect(0,0,ge.width,ge.height),r.scale(o,o),k>.005){r.save(),r.filter=t.cursorBlur>0?`blur(${t.cursorBlur}px)`:"none";const se=Math.max(1,t.cursorZoom);r.translate(N,z),r.rotate(P),r.scale(-1,1),r.translate((p-v)*F,0),r.rotate(-P),r.scale(se,se);const le=e.overscan,oe=X.k,he=Math.max(1,Math.ceil(k));r.globalAlpha=Math.min(1,k/he),r.globalCompositeOperation="lighter";const ue=e.mask&&e.rawCanvas?e.rawCanvas:e.canvas;for(let G=0;G<he;G++)r.drawImage(ue,-(X.nx+le)*oe,-(X.ny+le)*oe,(e.cssWidth+2*le)*oe,(e.cssHeight+2*le)*oe);r.restore();const ne=1/o,A=1/D;Ro(r,ge.width,ge.height,(G,W)=>{const re=-(((G+.5)*ne-N)*K+((W+.5)*ne-z)*ee);return re<=0?1:1-re*A})}if(ae>.005){const se=Math.max(Y,T,_)||1,le=Math.round(Y*255/se),oe=Math.round(T*255/se),he=Math.round(_*255/se),ue=D*1.2,ne=r.createLinearGradient(N+.5*K,z+.5*ee,N-ue*K,z-ue*ee),A=Math.min(1,ae);ne.addColorStop(0,`rgba(${le},${oe},${he},${A.toFixed(3)})`),ne.addColorStop(.45,`rgba(${le},${oe},${he},${(A*.4).toFixed(3)})`),ne.addColorStop(1,`rgba(${le},${oe},${he},0)`),r.globalCompositeOperation="lighter",r.fillStyle=ne,r.fillRect(0,0,l,s),r.globalCompositeOperation="source-over"}const de=Or(yt,n,o,ge.width,ge.height);de&&Ro(r,ge.width,ge.height,(se,le,oe)=>de[oe]===0?0:1),i.globalCompositeOperation="lighter",i.drawImage(ge,0,0,l,s),i.globalCompositeOperation="source-over"}wn(Dt,$t),Gt||(_e.style.display="",Gt=!0)}function Gr(){if(Ee)return Ee;const e=document.createElement("div");return e.className="metal-fx-cursor-spill",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;border-radius:50%;mix-blend-mode:plus-lighter;will-change:transform,opacity;opacity:0;display:none",document.body.appendChild(e),Ee=e,e}function ta(){!Ee||!Vt||(Ee.style.display="none",Ee.style.opacity="0",Vt=!1)}function _n(e){if(nt=0,!Rt)return;const t=performance.now();try{Wr(e)}catch(a){ja=!0,Pe(),ta(),ie&&(ie.cursorLight=null,ie=null),typeof console<"u"&&console.warn("metal-fx: cursor light disabled after error",a);return}performance.now()-t>6?++It>=20&&(It=0,Qa=performance.now()+5e3,Pe()):It>0&&It--}function Wr(e){const t=He,a=Math.min(.05,Math.max(.001,(e-La)/1e3));La=e;let n=null,o=0,i=0;if(t.enabled&&x&&!Number.isNaN(Te)){let l=Number.POSITIVE_INFINITY;const s=Math.max(1,t.reach),c=t.cursor&&Co()?Math.max(1,t.cursorDistance):0,u=Math.max(s,c);for(const d of x.instances){if(!d.visible||!d.canvas.isConnected)continue;const h=d.canvas.getBoundingClientRect();if(h.width<=0)continue;const m=d.overscan,g=h.width/(d.cssWidth+2*m),p=h.left+m*g,y=h.top+m*g,b=u*g;if(Te<p-b||Te>p+d.cssWidth*g+b||Ye<y-b||Ye>y+d.cssHeight*g+b)continue;const v=(Te-p)/g,f=(Ye-y)/g,M=Nr(v,f,d.cssWidth,d.cssHeight,d.cornerRadius,d.kind,ya),w=Math.abs(M);w<=u&&w<l&&(l=w,n=d,X.d=M,X.nx=ya.x,X.ny=ya.y,X.k=g,X.left=p,X.top=y)}if(n){if(l<=s){const d=1-l/s;o=d*d*(3-2*d)}l<=c&&(i=Math.min(1,(1-l/c)*3)),n.mask&&(X.nx=n.cssWidth/2,X.ny=n.cssHeight/2,n.wantRaw=!0)}}const r=1-Math.exp(-(a*1e3)/(Math.max(1,t.fadeMs)/3));if(tt+=(o-tt)*r,at+=(i-at)*r,n&&n!==ie&&(ie&&(ie.cursorLight=null,ba(ie,e)),ie=n),!n&&tt<.002&&at<.002){tt=0,at=0,ie&&(ie.cursorLight=null,ba(ie,e),ie=null),ta(),Pe();return}if(ie){if(t.catchLight){const l=ie.cursorLight??(ie.cursorLight={x:0,y:0,w:0});l.x=X.nx,l.y=X.ny,l.w=tt}else ie.cursorLight&&(ie.cursorLight=null);if(ba(ie,e),t.cursor&&at>.002&&za&&!Ja&&!Number.isNaN(Te)&&Co()&&$r()&&Mn(Te,Ye)?Vr(ie,t,at):Pe(),t.spill){const l=Gr(),s=hn(ie,X.nx,X.ny,2),c=Oa(ie,X.nx,X.ny,3),u=Math.max(s.r,s.g,s.b)||1,d=on(s.r*255/u,s.g*255/u,s.b*255/u),[h,m,g]=nn(d[0],Math.min(1,d[1]*t.spillSaturation),1);Ie.r+=(h-Ie.r)*.15,Ie.g+=(m-Ie.g)*.15,Ie.b+=(g-Ie.b)*.15;const p=Math.round(Ie.r/6)*6,y=Math.round(Ie.g/6)*6,b=Math.round(Ie.b/6)*6,v=`radial-gradient(closest-side, rgba(${p},${y},${b},1) 0%, rgba(${p},${y},${b},0.35) 45%, rgba(${p},${y},${b},0) 100%)`;v!==Pa&&(Pa=v,l.style.background=v);const f=Math.max(1,t.spillRadius*X.k);f!==Ua&&(Ua=f,l.style.width=`${(2*f).toFixed(1)}px`,l.style.height=`${(2*f).toFixed(1)}px`),t.spillBlur!==Na&&(Na=t.spillBlur,l.style.filter=t.spillBlur>0?`blur(${t.spillBlur}px)`:"");const M=X.left+X.nx*X.k,w=X.top+X.ny*X.k,O=Dt+(M-Dt)*t.spillOffset,L=$t+(w-$t)*t.spillOffset;l.style.transform=`translate3d(${(O-f).toFixed(2)}px,${(L-f).toFixed(2)}px,0)`;const I=Math.min(1,Math.max(0,c/.3)),B=1-t.spillLumGain+t.spillLumGain*I,Q=X.d<0?t.spillInside:1,U=Math.max(0,Math.min(1,t.spillStrength*tt*B*Q));Vt||(l.style.display="",Vt=!0),l.style.opacity=U.toFixed(3)}else ta();nt=requestAnimationFrame(_n)}}const aa=new Map;function Hr(e,t){const a=Math.sqrt(12*e*e/t+1);let n=Math.floor(a);n%2===0&&n--;const o=n+2,i=(12*e*e-t*n*n-4*t*n-3*t)/(-4*n-4),r=Math.round(i),l=[];for(let s=0;s<t;s++)l.push(s<r?n:o);return l}function Xr(e,t,a,n,o){const i=1/(o+o+1);for(let r=0;r<n;r++){const l=r*a;let s=0;for(let c=-o;c<=o;c++)s+=e[l+Math.min(a-1,Math.max(0,c))];for(let c=0;c<a;c++){t[l+c]=s*i;const u=l+Math.max(0,c-o),d=l+Math.min(a-1,c+o+1);s+=e[d]-e[u]}}}function Yr(e,t,a,n,o){const i=1/(o+o+1);for(let r=0;r<a;r++){let l=0;for(let s=-o;s<=o;s++)l+=e[Math.min(n-1,Math.max(0,s))*a+r];for(let s=0;s<n;s++){t[s*a+r]=l*i;const c=Math.max(0,s-o)*a+r,u=Math.min(n-1,s+o+1)*a+r;l+=e[u]-e[c]}}}function ca(e,t,a,n){if(n<=.05)return e;const o=new Float32Array(e.length);let i=e;for(const r of Hr(n,3)){const l=(r-1)/2;Xr(i,o,t,a,l),Yr(o,i,t,a,l)}return i}function qr(e,t,a,n,o,i,r){const l=document.createElement("canvas");l.width=a,l.height=n;const s=l.getContext("2d",{willReadFrequently:!0}),c=new Float32Array(a*n);if(!s)return c;s.scale(o,o),s.strokeStyle="#fff",s.lineCap="round",s.lineJoin="round",s.lineWidth=t,s.beginPath(),s.moveTo(i-e,r),s.lineTo(i+e,r),s.stroke();const u=s.getImageData(0,0,a,n).data;for(let d=0,h=3;d<c.length;d++,h+=4)c[d]=u[h]/255;return c}function Sn(e,t,a,n,o){let i=0;for(const p of e)i=Math.max(i,(p.stroke/2+3*p.blur)*a);const r=Math.ceil(i)+1,l=2*t+2*r,s=2*r,c=Math.ceil(l*n),u=Math.ceil(s*n),d=new Float32Array(c*u);for(const p of e){let y=qr(t,p.stroke*a,c,u,n,r,r);y=ca(y,c,u,p.blur*a*n);const b=p.opacity;for(let v=0;v<d.length;v++){const f=y[v]*b;d[v]=d[v]+f*(1-d[v])}}if(o>0){const p=r*n,y=r*n,b=o*a*n;for(let v=0;v<u;v++)for(let f=0;f<c;f++){const M=Math.hypot(f+.5-p,v+.5-y)/b;let w;M<=.3?w=1:M<=.65?w=1-(M-.3)/.35*.75:M<1?w=.25*(1-(M-.65)/.35):w=0,d[v*c+f]*=w}}const h=document.createElement("canvas");h.width=c,h.height=u;const m=h.getContext("2d"),g=new Uint8ClampedArray(c*u);for(let p=0;p<d.length;p++)g[p]=Math.round(Math.min(1,d[p])*255);if(m){const p=m.createImageData(c,u),y=p.data;for(let b=0,v=0;b<d.length;b++,v+=4)y[v]=255,y[v+1]=255,y[v+2]=255,y[v+3]=g[b];m.putImageData(p,0,0)}return{canvas:h,alpha:g,w:l,h:s,ax:r,ay:r}}function Rn(){return[C.haloStrokeXl,C.haloStrokeLg,C.haloStrokeMd,C.haloStrokeSm,C.haloBlurXl,C.haloBlurLg,C.haloBlurMd,C.haloBlurSm,C.haloOpXl,C.haloOpLg,C.haloOpMd,C.haloOpSm,C.extraStrokeOuter,C.extraStrokeCore,C.extraBlurOuter,C.extraBlurCore,C.extraFadeR,C.extraOpOuter].join(",")}function jr(e,t,a){const n=`h|${e.toFixed(2)}|${t}|${a}|${Rn()}`;let o=aa.get(n);return o||(o=Sn([{stroke:C.haloStrokeXl,blur:C.haloBlurXl,opacity:C.haloOpXl},{stroke:C.haloStrokeLg,blur:C.haloBlurLg,opacity:C.haloOpLg},{stroke:C.haloStrokeMd,blur:C.haloBlurMd,opacity:C.haloOpMd},{stroke:C.haloStrokeSm,blur:C.haloBlurSm,opacity:C.haloOpSm}],e,t,a,0),aa.set(n,o)),o}function Qr(e,t,a){const n=`e|${e.toFixed(2)}|${t}|${a}|${Rn()}`;let o=aa.get(n);return o||(o=Sn([{stroke:C.extraStrokeOuter,blur:C.extraBlurOuter,opacity:C.extraOpOuter},{stroke:C.extraStrokeCore,blur:C.extraBlurCore,opacity:1}],e,t,a,C.extraFadeR),aa.set(n,o)),o}function Bo(e,t,a,n,o){var i;const r=t<<16|a<<8|n;if(o.canvas&&o.tint===r&&o.src===e)return o.canvas;let l=o.canvas,s=o.img;(!l||!s||o.src!==e)&&(l=document.createElement("canvas"),l.width=e.canvas.width,l.height=e.canvas.height,s=((i=l.getContext("2d"))==null?void 0:i.createImageData(l.width,l.height))??null);const c=l.getContext("2d");if(c&&s){const u=s.data,d=e.alpha;for(let h=0,m=0;h<d.length;h++,m+=4)u[m]=t,u[m+1]=a,u[m+2]=n,u[m+3]=d[h];c.putImageData(s,0,0)}return o.canvas=l,o.img=s,o.tint=r,o.src=e,l}function Ka(e,t,a){const n=Math.max(0,Math.min(a,Math.min(e,t)/2));return 2*Math.max(0,e-2*n)+2*Math.max(0,t-2*n)+2*Math.PI*n}function oa(e,t,a,n){return n==="circle"?2*Math.PI*Math.max(0,Math.min(a,Math.min(e,t)/2)):Ka(e,t,a)}function Wt(e,t,a,n,o,i,r,l){const s=l||{x:0,y:0},c=Math.max(0,Math.min(n,Math.min(t,a)/2));if(r==="circle"){const b=2*Math.PI*c;if(b<=1e-4)return s.x=t*.5,s.y=a*.5,s;e=(e%b+b)%b;const v=-Math.PI/2+e/b*Math.PI*2,f=Math.max(0,c-o+i);return s.x=t*.5+f*Math.cos(v),s.y=a*.5+f*Math.sin(v),s}const u=Math.max(0,t-2*c),d=Math.max(0,a-2*c),h=Math.PI*c/2,m=2*(u+d)+4*h;e=(e%m+m)%m;const g=Math.max(0,c-o+i);let p=e;if(p<u)return s.x=c+p,s.y=o-i,s;if(p-=u,p<h){const b=-Math.PI/2+(h>0?p/h:0)*(Math.PI/2);return s.x=t-c+g*Math.cos(b),s.y=c+g*Math.sin(b),s}if(p-=h,p<d)return s.x=t-o+i,s.y=c+p,s;if(p-=d,p<h){const b=(h>0?p/h:0)*(Math.PI/2);return s.x=t-c+g*Math.cos(b),s.y=a-c+g*Math.sin(b),s}if(p-=h,p<u)return s.x=t-c-p,s.y=a-o+i,s;if(p-=u,p<h){const b=Math.PI/2+(h>0?p/h:0)*(Math.PI/2);return s.x=c+g*Math.cos(b),s.y=a-c+g*Math.sin(b),s}if(p-=h,p<d)return s.x=o-i,s.y=a-c-p,s;p-=d;const y=Math.PI+(h>0?p/h:0)*(Math.PI/2);return s.x=c+g*Math.cos(y),s.y=c+g*Math.sin(y),s}function Jr(e,t,a,n,o,i){const r=Math.max(0,Math.min(o,Math.min(a,n)/2));if(i==="circle"){const w=2*Math.PI*r;return w<=1e-4?0:((Math.atan2(t-n/2,e-a/2)+Math.PI/2)/(2*Math.PI)*w%w+w)%w}const l=Math.max(0,a-2*r),s=Math.max(0,n-2*r),c=Math.PI*r/2,u=Math.PI/2,d=l,h=d+c,m=h+s,g=m+c,p=g+l,y=p+c,b=y+s,v=e>=r&&e<=a-r,f=t>=r&&t<=n-r;if(v&&f){const w=e,O=a-e,L=t,I=n-t,B=Math.min(w,O,L,I);return B===L?e-r:B===O?h+(t-r):B===I?g+(a-r-e):y+(n-r-t)}if(v)return t<n/2?e-r:g+(a-r-e);if(f)return e>a/2?h+(t-r):y+(n-r-t);if(e>a/2&&t<n/2){const w=Math.atan2(t-r,e-(a-r));return d+(w+u)/u*c}if(e>a/2){const w=Math.atan2(t-(n-r),e-(a-r));return m+w/u*c}if(t>n/2){const w=Math.atan2(t-(n-r),e-r);return p+(w-u)/u*c}const M=Math.atan2(t-r,e-r);return b+(M+Math.PI)/u*c}const Ma={x:0,y:0},_a={x:0,y:0};function Kr(e,t,a,n,o,i){return Wt(e-.1,t,a,n,o,0,i,Ma),Wt(e+.1,t,a,n,o,0,i,_a),Math.atan2(_a.y-Ma.y,_a.x-Ma.x)}function Io(e,t,a){if(e===t)return a<e?0:1;const n=Math.max(0,Math.min(1,(a-e)/(t-e)));return n*n*(3-2*n)}function Zr(e){if(e.samplePoints&&e.samplePoints.length>0)return e.samplePoints.map((o,i)=>({x:o.x,y:o.y,arc:i}));const t=oa(e.width,e.height,e.cornerRadius,e.kind),a=C.inset*(e.scale??1),n=[];for(let o=0;o<go;o++){const i=o/go*t,r=Wt(i,e.width,e.height,e.cornerRadius,a,0,e.kind);n.push({x:r.x,y:r.y,arc:i})}return n}const ei=.05,ti=120*(1e3/15),Fo=1e3/15,Lo=2e3,Sa=400,ai=2.625,oi=1.008,ni=.31,Cn=140,kn=40,Tn=20,ri=34,Kt=.25,ii=.01,Po=.004,si=.5,li=3.5,Me={x:0,y:0};function Uo(e,t){const{width:a,height:n}=t,o=t.scale??1,i=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),r=oa(a,n,t.cornerRadius,t.kind)/Ka(Cn,kn,Tn),l=Math.max(1,C.haloHalfLen*r),s=Math.max(.6,C.extraHalfLen*r),c=jr(l,o,i),u=Qr(s,o,i),d=Math.ceil(Math.max(c.ay,u.ay)+C.extraOutward*r*o+2),h=document.createElement("div");h.className="metal-fx-glow-svg",h.setAttribute("aria-hidden","true");const m=document.createElement("div");m.className="metal-fx-glow-env",m.style.cssText="position:absolute;inset:0;pointer-events:none;opacity:0";const g=document.createElement("canvas");g.className="metal-fx-glow-canvas";const p=a+2*d,y=n+2*d;g.width=Math.ceil(p*i),g.height=Math.ceil(y*i),g.style.cssText=`position:absolute;left:${-d}px;top:${-d}px;width:${p}px;height:${y}px;pointer-events:none`,m.appendChild(g),h.appendChild(m),e.appendChild(h);const b=g.getContext("2d",{willReadFrequently:!!t.maskDataUrl});if(!b)throw new Error("metal-fx: glow canvas 2D context unavailable");const v={wrap:h,env:m,canvas:g,ctx:b,surroundPath:null,bandPath:null,maskAlpha:null,maskReady:!1,margin:d,dpr:i,halo:c,extra:u,haloTint:{canvas:null,img:null,tint:-1,src:null},extraTint:{canvas:null,img:null,tint:-1,src:null},mO:_t(),mI:_t(),maskSum:Number.NaN,maskDeformed:!1,deform:null,width:a,height:n,cornerRadius:t.cornerRadius,kind:t.kind,scale:o,perim:Zr(t),pointMode:!!(t.samplePoints&&t.samplePoints.length>0),currentIdx:0,appearedAt:0,glowOpacity:0,relocTween:null,relocNextIdx:-1,relocMul:0,envClock:0,cursorMode:!1,cursorArc:0,cursorTargetArc:0,lastTickMs:0,wanderS:0,wanderTargetS:0,wanderFrames:0,tintFrom:{r:255,g:255,b:255},tintTarget:{r:255,g:255,b:255},tintTween:null,tintHoldUntil:0,dX:Number.NaN,dY:Number.NaN,dAng:Number.NaN,dEX:Number.NaN,dEY:Number.NaN,dHOp:Number.NaN,dEOp:Number.NaN,dHaloTint:"",dExtraTint:"",dirty:!0,dEnv:-1};if(t.maskDataUrl){const f=new Image;f.onload=()=>{const M=document.createElement("canvas");M.width=g.width,M.height=g.height;const w=M.getContext("2d",{willReadFrequently:!0});if(!w)return;w.scale(i,i),w.drawImage(f,d,d,a,n);const O=w.getImageData(0,0,M.width,M.height).data,L=M.width*M.height,I=new Float32Array(L);for(let R=0,V=3;R<L;R++,V+=4)I[R]=O[V]/255;const B=ca(Float32Array.from(I),M.width,M.height,li*i);let Q=0;for(let R=0;R<L;R++)B[R]>Q&&(Q=B[R]);const U=Q>0?si/Q:0,$=new Uint8ClampedArray(L);for(let R=0;R<L;R++)$[R]=Math.round(Math.max(I[R],B[R]*U)*255);v.maskAlpha=$,v.maskReady=!0,v.dirty=!0},f.src=t.maskDataUrl}else Ha(v,null);return v}function Ha(e,t){if(e.pointMode)return;const{margin:a,width:n,height:o,cornerRadius:i}=e,r=e.kind==="circle"?2:1;St(0,0,n,o,i,t,e.mO),St(r,r,n-2*r,o-2*r,Math.max(0,i-r),t,e.mI);const l=new Path2D;Ra(l,e.mO,a);const s=new Path2D;Ra(s,e.mO,a),Ra(s,e.mI,a);const c=new Path2D;c.rect(0,0,n+2*a,o+2*a),c.addPath(l),e.surroundPath=c,e.bandPath=s,e.maskReady=!0}function Ra(e,t,a){const n=t.xy;for(let o=0;o<t.n;o++){const i=n[o*2]+a,r=n[o*2+1]+a;o===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function ci(e,t){if(!e)return 0;St(0,0,t.width,t.height,t.cornerRadius,e,t.mO);let a=0;const n=t.mO.xy;for(let o=0;o<t.mO.n;o+=4)a+=n[o*2]*1.37+n[o*2+1];return a}function ui(e,t){if(e.deform=t,!e.pointMode)if(t){const a=ci(t,e);a!==e.maskSum&&(e.maskSum=a,Ha(e,t),e.maskDeformed=!0,e.dirty=!0)}else e.maskDeformed&&(e.maskSum=Number.NaN,Ha(e,null),e.maskDeformed=!1,e.dirty=!0)}function di(e,t,a,n,o="dark"){var i;const{width:r,height:l,cornerRadius:s,perim:c}=e;if(c.length===0)return!1;const u=2;let d=-1,h=e.currentIdx,m=0;for(let A=0;A<c.length;A++){const G=c[A],W=Oa(t,G.x,G.y,u);W>d&&(d=W,h=A),A===e.currentIdx&&(m=W)}const g=e.appearedAt>0&&a-e.appearedAt<C.minDwellMs,p=C.baseOp+(C.peakOp-C.baseOp)*Io(C.lumLo,C.lumHi,m),y=!g&&d-m>ei,b=t.cursorLight,v=He.enabled&&He.catchLight&&!e.pointMode&&!!b&&b.w>.02,f=oa(r,l,s,e.kind);v&&(e.cursorTargetArc=Jr(b.x,b.y,r,l,s,e.kind));const M=v?Math.min(1,C.peakOp*He.catchGain*b.w):0,w=e.lastTickMs>0?Math.min(200,Math.max(.5,a-e.lastTickMs)):Fo;e.lastTickMs=a,e.envClock+=Math.min(w,ri);const O=A=>1-Math.pow(1-A,w/Fo),L=Math.max(1,C.relocFadeMs),I=Math.max(1,C.relocFadeOutMs),B=-2,Q=-3,U=()=>{e.appearedAt=a,e.wanderS=0,e.wanderTargetS=0,e.wanderFrames=0,e.relocTween=At(0,1,L,Ba.smoothstep),Ot(e.relocTween,e.envClock)},$=A=>{e.relocNextIdx=A,e.relocTween=At(1,0,I,Ba.smoothstep),Ot(e.relocTween,e.envClock)};if((i=e.relocTween)!=null&&i.done&&e.relocTween.to===0){let A=e.relocNextIdx;if(A===B&&!v&&(A=Q),A===Q)e.cursorMode=!1,e.appearedAt=0,e.relocTween=null;else if(A===B)e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=M,U();else{e.currentIdx=A;const G=c[e.currentIdx],W=Oa(t,G.x,G.y,u);e.glowOpacity=C.baseOp+(C.peakOp-C.baseOp)*Io(C.lumLo,C.lumHi,W),U()}}if((!e.relocTween||e.relocTween.done)&&(e.appearedAt===0?(v?(e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=M):(e.cursorMode=!1,e.currentIdx=h,e.glowOpacity=p),U()):v!==e.cursorMode?$(v?B:Q):!e.cursorMode&&y&&$(h)),e.cursorMode){v&&(e.glowOpacity=M);const A=Math.max(.01,Math.min(1,He.catchFollow)),G=1-Math.pow(1-A,w/(1e3/60));let W=e.cursorTargetArc-e.cursorArc;W=(W%f+f*1.5)%f-f/2,e.cursorArc+=W*G}else e.glowOpacity+=(p-e.glowOpacity)*O(C.fadeRate);e.glowOpacity=Math.max(0,Math.min(1,e.glowOpacity)),e.relocMul=e.relocTween?_o(e.relocTween,e.envClock):1;const R=oa(r,l,s,e.kind)/Ka(Cn,kn,Tn),V=C.wanderRange*R;e.wanderFrames+=w,e.wanderFrames>=ti&&(e.wanderTargetS=(Math.random()*2-1)*V,e.wanderFrames=0),e.wanderS+=(e.wanderTargetS-e.wanderS)*O(C.wanderLerp);let J,Y,T,_,k;if(e.pointMode){const A=c[e.currentIdx];J=A.x+e.wanderS,Y=A.y,T=0,_=J,k=Y}else{const A=e.cursorMode?e.cursorArc:c[e.currentIdx].arc+e.wanderS,G=C.inset*e.scale;Wt(A,r,l,s,G,0,e.kind,Me),J=Me.x,Y=Me.y,T=Kr(A,r,l,s,G,e.kind);const W=C.extraOutward*R*e.scale;Wt(A,r,l,s,G,W,e.kind,Me),_=Me.x,k=Me.y}e.deform&&(e.deform(J,Y,Me),J=Me.x,Y=Me.y,e.deform(_,k,Me),_=Me.x,k=Me.y);const ae=o==="light",K=ae?dr(t,J,Y,u):hn(t,J,Y,u);e.tintTween?e.tintTween.done&&(ae?(e.tintFrom={r:e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*e.tintTween.val,g:e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*e.tintTween.val,b:e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*e.tintTween.val},e.tintTarget={...K},e.tintTween=At(0,1,Sa),Ot(e.tintTween,a)):a>=e.tintHoldUntil&&(e.tintFrom={...e.tintTarget},e.tintTarget={...K},e.tintTween=At(0,1,Sa),Ot(e.tintTween,a),e.tintHoldUntil=a+Lo)):(e.tintFrom={...K},e.tintTarget={...K},e.tintTween=At(0,1,Sa),Ot(e.tintTween,a),e.tintHoldUntil=ae?0:a+Lo),_o(e.tintTween,a);const ee=e.tintTween.val;let P,F,N;if(ae)P=Math.round(e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*ee),F=Math.round(e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*ee),N=Math.round(e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*ee);else{const A=e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*ee,G=e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*ee,W=e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*ee,re=Math.max(A,G,W)||1;P=Math.round(255*(A/re)),F=Math.round(255*(G/re)),N=Math.round(255*(W/re))}const z=`rgb(${P},${F},${N})`;let D="#ffffff";if(ae){const A=on(P,F,N),[G,W,re]=nn(A[0],Math.min(1,A[1]*ai),Math.max(ni,A[2]*oi));D=`rgb(${G},${W},${re})`}const de=Math.max(0,Math.min(1,n))*(e.pointMode?C.pointGain:1),se=Math.min(1,e.glowOpacity*C.haloOpMul*de),le=Math.min(1,e.glowOpacity*C.extraIntensity*de);if(Math.abs(e.relocMul-e.dEnv)>.002){const A=e.relocMul>=.998&&e.dEnv<.998;e.dEnv=e.relocMul,e.env.style.opacity=e.relocMul.toFixed(3),A&&(e.dirty=!0)}const oe=!!(e.relocTween&&!e.relocTween.done)||e.cursorMode,he=!(Math.abs(J-e.dX)<Kt&&Math.abs(Y-e.dY)<Kt&&Math.abs(T-e.dAng)<ii&&Math.abs(_-e.dEX)<Kt&&Math.abs(k-e.dEY)<Kt),ue=!(Math.abs(se-e.dHOp)<Po&&Math.abs(le-e.dEOp)<Po),ne=z!==e.dHaloTint||D!==e.dExtraTint;return(e.dirty||he||ue||ne)&&(e.dX=J,e.dY=Y,e.dAng=T,e.dEX=_,e.dEY=k,e.dHOp=se,e.dEOp=le,e.dHaloTint=z,e.dExtraTint=D,e.dirty=!1,hi(e,J,Y,T,_,k,se,le,z,D)),oe}function hi(e,t,a,n,o,i,r,l,s,c){const{ctx:u,canvas:d,dpr:h,margin:m}=e;if(u.setTransform(1,0,0,1,0,0),u.globalCompositeOperation="source-over",u.globalAlpha=1,u.clearRect(0,0,d.width,d.height),r<=.002&&l<=.002||!e.maskReady)return;const g=r>.002?Bo(e.halo,...No(s),e.haloTint):null,p=l>.002?c==="#ffffff"?e.extra.canvas:Bo(e.extra,...No(c),e.extraTint):null,y=M=>{g&&(u.save(),u.translate(t+m,a+m),u.rotate(n),u.globalAlpha=r*M,u.drawImage(g,-e.halo.ax,-e.halo.ay,e.halo.w,e.halo.h),u.restore()),p&&(u.save(),u.translate(o+m,i+m),u.rotate(n),u.globalAlpha=l*M,u.drawImage(p,-e.extra.ax,-e.extra.ay,e.extra.w,e.extra.h),u.restore())};if(!e.pointMode&&e.surroundPath&&e.bandPath){u.save(),u.scale(h,h),u.clip(e.surroundPath,"evenodd"),y(.5),u.restore(),u.save(),u.scale(h,h),u.clip(e.bandPath,"evenodd"),y(1),u.restore();return}u.save(),u.scale(h,h),y(1),u.restore();const b=e.maskAlpha;if(!b)return;const v=u.getImageData(0,0,d.width,d.height),f=v.data;for(let M=0,w=3;M<b.length;M++,w+=4){const O=b[M];if(O!==255){if(O===0){f[w]=0;continue}f[w]=(f[w]*O+127)/255}}u.putImageData(v,0,0)}const mt=[255,255,255];function No(e){if(e[0]==="#")return mt[0]=parseInt(e.slice(1,3),16),mt[1]=parseInt(e.slice(3,5),16),mt[2]=parseInt(e.slice(5,7),16),mt;let t=4,a=0,n=0;for(;t<e.length&&n<3;){const o=e.charCodeAt(t++);o>=48&&o<=57?a=a*10+(o-48):(o===44||o===41)&&(mt[n++]=a,a=0)}return mt}function fi(e,t){e.pointMode===t.pointMode&&(t.currentIdx=Math.min(e.currentIdx,Math.max(0,t.perim.length-1)),t.appearedAt=e.appearedAt,t.glowOpacity=e.glowOpacity,t.relocTween=e.relocTween,t.relocNextIdx=e.relocNextIdx,t.relocMul=e.relocMul,t.envClock=e.envClock,t.cursorMode=e.cursorMode,t.cursorArc=e.cursorArc,t.cursorTargetArc=e.cursorTargetArc,t.lastTickMs=e.lastTickMs,t.wanderS=e.wanderS,t.wanderTargetS=e.wanderTargetS,t.wanderFrames=e.wanderFrames,t.tintFrom=e.tintFrom,t.tintTarget=e.tintTarget,t.tintTween=e.tintTween,t.tintHoldUntil=e.tintHoldUntil,t.dEnv=e.relocMul,t.env.style.opacity=e.relocMul.toFixed(3))}const zo=Object.freeze({offsetY:1,blur:.5,alpha:.9,color:"#ffffff"});function mi(e,t,a){const n=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),o=Math.ceil(3*a.blur+Math.abs(a.offsetY)+1),i=t.width+2*o,r=t.height+2*o,l=document.createElement("canvas");l.className="metal-fx-rim-canvas",l.setAttribute("aria-hidden","true"),l.width=Math.ceil(i*n),l.height=Math.ceil(r*n),l.style.cssText=`position:absolute;left:${-o}px;top:${-o}px;width:${i}px;height:${r}px;pointer-events:none`;const s=l.getContext("2d"),c=document.createElement("canvas");c.width=l.width,c.height=l.height;const u=c.getContext("2d",{willReadFrequently:!0});if(!s||!u)return null;e.appendChild(l);const d={canvas:l,ctx:s,scratch:c,sctx:u,width:t.width,height:t.height,cornerRadius:t.cornerRadius,kind:t.kind,ring:t.ring,margin:o,dpr:n,opts:a,mO:_t(),mI:_t(),sum:Number.NaN};return En(d,null,!0),d}function Do(e,t,a){const n=t.xy;for(let o=0;o<t.n;o++){const i=n[o*2]+a,r=n[o*2+1]+a;o===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function En(e,t,a=!1){const{width:n,height:o,cornerRadius:i,ring:r,margin:l,dpr:s}=e;St(0,0,n,o,i,t,e.mO),St(r,r,n-2*r,o-2*r,Math.max(0,i-r),t,e.mI);let c=0;const u=e.mO.xy;for(let R=0;R<e.mO.n;R+=4)c+=u[R*2]*1.37+u[R*2+1];if(!a&&c===e.sum)return;e.sum=c;const{sctx:d,scratch:h,ctx:m,canvas:g,opts:p}=e,y=h.width,b=h.height;d.setTransform(1,0,0,1,0,0),d.clearRect(0,0,y,b),d.scale(s,s),d.fillStyle="#fff",d.beginPath(),Do(d,e.mO,l),Do(d,e.mI,l),d.fill("evenodd");const v=d.getImageData(0,0,y,b).data,f=y*b,M=new Float32Array(f);for(let R=0,V=3;R<f;R++,V+=4)M[R]=v[V]/255;const w=Math.round(p.offsetY*s)*y,O=new Float32Array(f);if(w>=0)for(let R=0;R<f;R++)O[R]=Math.max(0,M[R]-(R>=w?M[R-w]:0));else for(let R=0;R<f;R++)O[R]=Math.max(0,M[R]-(R-w<f?M[R-w]:0));const L=ca(O,y,b,p.blur*s),I=parseInt(p.color.slice(1,3),16),B=parseInt(p.color.slice(3,5),16),Q=parseInt(p.color.slice(5,7),16),U=m.createImageData(y,b),$=U.data;for(let R=0,V=0;R<f;R++,V+=4)$[V]=I,$[V+1]=B,$[V+2]=Q,$[V+3]=Math.round(Math.min(1,L[R]*M[R]*p.alpha)*255);m.setTransform(1,0,0,1,0,0),m.putImageData(U,0,0)}function $o(e){e&&e.canvas.remove()}const ea=12,Vo=32,Go=1,Wo=.55,pi=1,gi=1,xi=.85,vi=0,wi=1.3,Ho=3.6,bi=.7,yi=1,Mi=.52,_i=1,Si=.044,Ri=235,Ci=2.535,Xo=.7,ki=.5,Ti=new Set(["INPUT","TEXTAREA","SELECT","OPTION"]);function Ei(e,t){const a=Math.max(e.left-t.right,t.left-e.right,0),n=Math.max(e.top-t.bottom,t.top-e.bottom,0);return Math.sqrt(a*a+n*n)}function Ai(e,t,a,n){return!(Math.min(e.bottom,t.bottom)-Math.max(e.top,t.top)<a||Math.max(e.left-t.right,t.left-e.right,0)>n)}function Oi(e,t,a,n){return Math.min(e.right,t.right)-Math.max(e.left,t.left)<a?!1:Math.max(e.top-t.bottom,t.top-e.bottom,0)<=n}function rt(e,t,a,n,o,i){const r=Math.max(0,Math.min(i,n*.5,o*.5)),l=e.roundRect;if(typeof l=="function"){l.call(e,t,a,n,o,r);return}e.moveTo(t+r,a),e.lineTo(t+n-r,a),e.quadraticCurveTo(t+n,a,t+n,a+r),e.lineTo(t+n,a+o-r),e.quadraticCurveTo(t+n,a+o,t+n-r,a+o),e.lineTo(t+r,a+o),e.quadraticCurveTo(t,a+o,t,a+o-r),e.lineTo(t,a+r),e.quadraticCurveTo(t,a,t+r,a)}function An(e,t,a,n,o){if(!o.flipX&&!o.flipY){e.drawImage(t,o.sx??0,o.sy??0,a,n,o.x,o.y,o.w,o.h);return}e.save(),o.flipX&&(e.translate(o.x+o.w,0),e.scale(-1,1)),o.flipY&&(e.translate(0,o.y+o.h),e.scale(1,-1)),e.drawImage(t,o.sx??0,o.sy??0,a,n,o.flipX?0:o.x,o.flipY?0:o.y,o.w,o.h),e.restore()}const Bi=4;function Ii(e,t,a,n,o,i,r){if(n<=2*r||o<=2*r){e.beginPath(),rt(e,t,a,n,o,i),e.clip();return}e.beginPath(),rt(e,t,a,n,o,i),rt(e,t+r,a+r,n-2*r,o-2*r,Math.max(0,i-r)),e.clip("evenodd")}function Fi(e,t,a,n,o,i,r,l,s,c,u,d){const h=d??Math.max(1,Math.round((ea+Bi*3)*u));let m=Math.max(0,r),g=!0;for(let p=0;p<3&&m>1e-4;p++){const y=Math.min(1,m);e.save(),Ii(e,c.x,c.y,c.w,c.h,c.r,h),e.globalCompositeOperation=g?"source-over":"lighter",g=!1,e.globalAlpha=y,An(e,t,a,n,s),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=l,e.fillRect(0,0,o,i),e.restore(),m-=y}}function On(e,t,a,n,o,i,r){const l=r|0;if(l<1||n<=2*l||o<=2*l){e.beginPath(),rt(e,t,a,n,o,i),e.clip();return}e.beginPath(),rt(e,t,a,n,o,i),rt(e,t+l,a+l,n-2*l,o-2*l,Math.max(0,i-l)),e.clip("evenodd")}function Li(e,t,a,n,o,i,r,l,s,c,u,d){let h=l*u,m=!0;for(let g=0;g<3&&h>1e-4;g++){const p=Math.min(1,h);e.save(),On(e,r.x,r.y,r.w,r.h,r.r,s),e.globalCompositeOperation=m?"source-over":"lighter",m=!1,e.globalAlpha=p,An(e,t,a,n,d),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=c,e.fillRect(0,0,o,i),e.restore(),h-=p}}function Pi(e,t,a,n,o,i,r,l){const s=e.createLinearGradient(n,o,i,r);s.addColorStop(0,`rgba(255,255,255,${l.toFixed(3)})`),s.addColorStop(.5,`rgba(255,255,255,${(l*.45).toFixed(3)})`),s.addColorStop(1,"rgba(255,255,255,0)"),e.save(),On(e,t.x,t.y,t.w,t.h,t.r,a),e.globalCompositeOperation="lighter",e.lineWidth=a*2,e.strokeStyle=s,e.beginPath(),rt(e,t.x,t.y,t.w,t.h,t.r),e.stroke(),e.restore()}function Bn(e){const t=getComputedStyle(e),a=[parseFloat(t.borderTopLeftRadius)||0,parseFloat(t.borderTopRightRadius)||0,parseFloat(t.borderBottomRightRadius)||0,parseFloat(t.borderBottomLeftRadius)||0].filter(n=>n>0);return a.length?Math.min.apply(null,a):0}function In(e){const t=getComputedStyle(e),a=Math.max(parseFloat(t.borderTopWidth)||0,parseFloat(t.borderRightWidth)||0,parseFloat(t.borderBottomWidth)||0,parseFloat(t.borderLeftWidth)||0);let n=0,o=0;const i=t.boxShadow;if(i&&i!=="none"){const l=i.replace(/rgba?\([^)]*\)/g,u=>u.replace(/,/g,"\0")).split(/,\s*/);let s=1/0,c=1/0;for(const u of l){const d=u.match(/-?\d+(?:\.\d+)?px/g);if(!d||d.length<4)continue;const h=parseFloat(d[3]);h>0&&(/\binset\b/.test(u)?h<s&&(s=h):h<c&&(c=h))}Number.isFinite(s)&&(n=s),Number.isFinite(c)&&(o=c)}const r=Math.max(a,o);return{width:Math.max(a,n,o)||1,outerCssPx:r}}function Yo(e){e.cornerRadius=Bn(e.el);const t=In(e.el);e.hairlineWidth=t.width,e.hairlineOuterCssPx=t.outerCssPx}function Ui(e){typeof ResizeObserver<"u"&&(e.resizeObserver=new ResizeObserver(()=>Yo(e)),e.resizeObserver.observe(e.el)),typeof MutationObserver<"u"&&(e.mutationObserver=new MutationObserver(()=>Yo(e)),e.mutationObserver.observe(e.el,{attributes:!0,attributeFilter:["style","class"]}))}function Ni(e){var t,a;(t=e.resizeObserver)==null||t.disconnect(),e.resizeObserver=null,(a=e.mutationObserver)==null||a.disconnect(),e.mutationObserver=null}const Qe=new Set,Fn=Object.freeze({enabled:!0,radius:11.5,strength:.57,penumbra:.55,falloff:.21,edgeFade:.7,softness:.24,repaintMs:36}),Ht={...Fn};function zi(e){Object.assign(Ht,e),ua()}function ys(){zi({...Fn})}let We=null,Ca=0,qo=0,jo=!1;function ua(){Ca!==0||typeof requestAnimationFrame>"u"||(Ca=requestAnimationFrame(e=>{if(Ca=0,e-qo<Ht.repaintMs){ua();return}qo=e,Pn()}))}let na=!1;function Di(e,t){const a=Ht.radius;for(const n of Qe){const o=n.anchorEl.getBoundingClientRect(),i=n.el.getBoundingClientRect(),r=Math.min(o.left,i.left)-a,l=Math.max(o.right,i.right)+a,s=Math.min(o.top,i.top)-a,c=Math.max(o.bottom,i.bottom)+a;if(e>=r&&e<=l&&t>=s&&t<=c)return!0}return!1}function Qo(e){if(We={x:e.clientX,y:e.clientY},!Ht.enabled)return;const t=Di(e.clientX,e.clientY);(t||na)&&ua(),na=t}function Zt(){We=null,na&&ua(),na=!1}function Ln(e){typeof document>"u"||e===jo||(jo=e,e?(document.addEventListener("pointermove",Qo,{passive:!0}),document.addEventListener("pointerleave",Zt),window.addEventListener("blur",Zt)):(document.removeEventListener("pointermove",Qo),document.removeEventListener("pointerleave",Zt),window.removeEventListener("blur",Zt),We=null))}function $i(e,t,a,n,o,i,r,l,s){if(!We)return;const c=Ht;if(!c.enabled||c.strength<=0)return;const u=c.radius;let d,h,m,g,p,y;if(o){const T=a.left>=n.right;d=T?n.right:a.right,h=T?a.left:n.left,m=We.x,g=We.y,p=Math.max(a.top,n.top),y=Math.min(a.bottom,n.bottom)}else{const T=a.top>=n.bottom;d=T?n.bottom:a.bottom,h=T?a.top:n.top,m=We.y,g=We.x,p=Math.max(a.left,n.left),y=Math.min(a.right,n.right)}const b=Math.min(d,h),v=Math.max(d,h),f=Math.max(1,v-b);if(m<b-u||m>v+u||g<p-u||g>y+u)return;const M=Math.max(0,Math.min(1,Math.abs(m-d)/f)),w=Math.max(.5,u*c.edgeFade),O=Math.min(1,Math.min(m-(b-u),v+u-m)/w),L=Math.min(1,Math.min(g-(p-u),y+u-g)/w),I=c.strength*(1-c.falloff*M)*O*L;if(I<=.001)return;const B=u*s*(1+c.penumbra*M),Q=o?(g-n.top+l)*s:(g-n.left+l)*s,U=Math.max(0,Math.min(.5,(1-c.softness)*.5)),$=Math.max(.001,.5-U),R=o?r:i,V=Math.max(0,Math.floor(Q-B)),J=Math.min(R,Math.ceil(Q+B));if(J<=V)return;const Y=new Float32Array(J-V);for(let T=V;T<J;T++){const _=(T+.5-(Q-B))/(2*B),k=_<$?_/$:_>1-$?(1-_)/$:1;Y[T-V]=1-I*Math.max(0,Math.min(1,k))}for(const T of[e,t]){const _=o?0:V,k=o?V:0,ae=o?i:J-V,K=o?J-V:r,ee=T.getImageData(_,k,ae,K),P=ee.data;if(o)for(let F=0;F<K;F++){const N=Y[F];if(!(N>=.999))for(let z=F*ae*4+3,D=(F+1)*ae*4;z<D;z+=4)P[z]=P[z]*N}else for(let F=0;F<K;F++)for(let N=0;N<ae;N++){const z=Y[N];if(z>=.999)continue;const D=(F*ae+N)*4+3;P[D]=P[D]*z}T.putImageData(ee,_,k)}}let Fe=null,gt=null,xt=null,vt=null;function Vi(e,t){return Fe||(Fe=document.createElement("canvas"),gt=document.createElement("canvas"),xt=Fe.getContext("2d",{alpha:!0}),vt=gt.getContext("2d",{alpha:!0})),!xt||!vt||!Fe||!gt?!1:(Fe.width!==e&&(Fe.width=e,gt.width=e),Fe.height!==t&&(Fe.height=t,gt.height=t),xt.setTransform(1,0,0,1,0,0),vt.setTransform(1,0,0,1,0,0),xt.globalCompositeOperation="source-over",vt.globalCompositeOperation="source-over",xt.clearRect(0,0,e,t),vt.clearRect(0,0,e,t),!0)}function Gi(e,t,a,n=1){if(typeof document>"u"||Ti.has(e.tagName))return null;for(const g of Qe)if(g.el===e)return g.strength=n,g;const o=document.createElement("div");o.setAttribute("data-metal-fx-reflection",""),o.setAttribute("aria-hidden","true");const i=document.createElement("canvas");i.className="metal-fx-reflection-canvas";const r=i.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!r)return null;const l=document.createElement("canvas");l.className="metal-fx-reflection-stroke-canvas";const s=l.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!s)return null;o.appendChild(i),o.appendChild(l);const c=getComputedStyle(e);let u=!1;c.position==="static"&&(e.style.position="relative",u=!0);let d=!1;c.isolation!=="isolate"&&(e.style.isolation="isolate",d=!0),e.setAttribute("data-metal-fx-reflect-host",""),e.insertBefore(o,e.firstChild);const h=In(e),m={el:e,anchor:t,anchorEl:a,strength:n,wrap:o,canvas:i,ctx:r,strokeCanvas:l,strokeCtx:s,cornerRadius:Bn(e),hairlineWidth:h.width,hairlineOuterCssPx:h.outerCssPx,appliedPositionRelative:u,appliedIsolation:d,resizeObserver:null,mutationObserver:null};return Ui(m),Qe.add(m),Ln(!0),m}function Wi(e){for(const t of Qe)if(t.el===e){Ni(t),t.canvas.width=0,t.canvas.height=0,t.strokeCanvas.width=0,t.strokeCanvas.height=0,t.wrap.parentNode===t.el&&t.el.removeChild(t.wrap),t.el.removeAttribute("data-metal-fx-reflect-host"),t.appliedPositionRelative&&(t.el.style.position=""),t.appliedIsolation&&(t.el.style.isolation=""),Qe.delete(t),Qe.size===0&&Ln(!1);return}}function Hi(e,t,a,n,o){if(n<1||o<1)return null;const i=e.getContext("2d");if(!i)return null;const r=i.getImageData(t,a,n,o).data;let l=n,s=o,c=-1,u=-1;for(let d=0;d<o;d++){const h=d*n;for(let m=0;m<n;m++)r[(h+m)*4+3]>8&&(m<l&&(l=m),m>c&&(c=m),d<s&&(s=d),d>u&&(u=d))}return c<0?null:{x:t+l,y:a+s,w:c-l+1,h:u-s+1}}function Pn(){if(Qe.size===0)return;const e=typeof window<"u"&&window.devicePixelRatio||1,t=new Map;for(const a of Qe){const n=a.el.getBoundingClientRect();let o=t.get(a.anchorEl);if(o||(o=a.anchorEl.getBoundingClientRect(),t.set(a.anchorEl,o)),n.width<1||n.height<1||o.width<1||o.height<1)continue;const i=a.el.hasAttribute("data-metal-fx-text");if(i&&!a.glyphStyled&&(a.canvas.style.filter="blur(0.4px) saturate(1.35) brightness(1.2)",a.glyphStyled=!0),!Ai(o,n,Go,Vo)&&!Oi(o,n,Go,Vo)){a.canvas.width!==1&&(a.canvas.width=1,a.canvas.height=1),a.strokeCanvas.width!==1&&(a.strokeCanvas.width=1,a.strokeCanvas.height=1);continue}const r=i&&!!a.anchor.mask;r&&!a.anchor.wantRaw&&(a.anchor.wantRaw=!0),a.anchor.wantRing||(a.anchor.wantRing=!0);const l=!!a.anchor.deform&&!!a.anchor.ringCanvas,s=r&&a.anchor.rawCanvas?a.anchor.rawCanvas:l?a.anchor.ringCanvas:a.anchor.canvas,c=Math.round(a.anchor.overscan*e);let u=c,d=c,h=(s.width|0)-2*c,m=(s.height|0)-2*c;if(a.anchor.mask&&!r){const K=Hi(s,u,d,h,m);K&&(u=K.x,d=K.y,h=K.w,m=K.h)}if(h<4||m<4)continue;const g=(o.left+o.right)*.5,p=(o.top+o.bottom)*.5,y=(n.left+n.right)*.5,b=(n.top+n.bottom)*.5,v=g-y,f=p-b,M=Math.max(o.left-n.right,n.left-o.right,0),w=Math.max(o.top-n.bottom,n.top-o.bottom,0),O=M>=w,L=Ei(o,n);let I=1-Math.min(1,L/ea);I=I*I*(3-2*I);const B=Wo+(pi-Wo)*I,Q=Math.min(Ho,B*wi*bi)*a.strength,U=o.left>=n.left&&o.right<=n.right&&o.top>=n.top&&o.bottom<=n.bottom?[!0,!1]:[O],$=a.anchor.scale??1,R=Math.max(yi*$,a.hairlineWidth),V=Math.max(1,Math.round(R*e)),J=Math.max(1,Math.round(Math.max(_i*$,a.hairlineWidth)*e)),Y=a.hairlineOuterCssPx;a.wrap.style.inset=`${-Y}px`,a.wrap.style.borderRadius=`${Math.max(0,a.cornerRadius)}px`;const T=Math.max(1,Math.round((n.width+Y*2)*e)),_=Math.max(1,Math.round((n.height+Y*2)*e));a.canvas.width!==T&&(a.canvas.width=T),a.canvas.height!==_&&(a.canvas.height=_),a.strokeCanvas.width!==T&&(a.strokeCanvas.width=T),a.strokeCanvas.height!==_&&(a.strokeCanvas.height=_);const k=a.ctx;k.setTransform(1,0,0,1,0,0),k.clearRect(0,0,T,_);const ae=a.strokeCtx;ae.setTransform(1,0,0,1,0,0),ae.clearRect(0,0,T,_);for(const[K,ee]of U.entries()){const P=K>0&&Vi(T,_),F=P?xt:k,N=P?vt:ae,z=Math.min((i?ea*1.5:ea)*e,Math.max(T,_));let D,de,se,le;ee?(D=v>0?T:0,se=v>0?T-z:z,de=_*.5,le=_*.5):(de=f>0?_:0,le=f>0?_-z:z,D=T*.5,se=T*.5);const oe=k.createLinearGradient(D,de,se,le);oe.addColorStop(0,`rgba(0,0,0,${gi})`),oe.addColorStop(.5,`rgba(0,0,0,${xi})`),oe.addColorStop(1,`rgba(0,0,0,${vi})`);const he=h/e,ue=i?Math.max(1,Math.min(ee?T:_,Math.round(ee?h:m))):Math.max(1,Math.round(Ri*Math.max(.1,he/140)*e));let ne,A,G,W,re=!1,Se=!1;if(ee){const H=Math.max(o.top,n.top),Z=Math.min(o.bottom,n.bottom);re=!0,ne=v>0?T-ue:0,A=Math.round((H-n.top+Y)*e),G=ue,W=Math.max(1,Math.round((Z-H)*e))}else{const H=Math.max(o.left,n.left),Z=Math.min(o.right,n.right);Se=!0,ne=Math.round((H-n.left+Y)*e),A=f>0?_-ue:0,G=Math.max(1,Math.round((Z-H)*e)),W=ue}const we={x:ne,y:A,w:G,h:W,flipX:re,flipY:Se,sx:u,sy:d},ve={x:0,y:0,w:T,h:_,r:Math.max(0,a.cornerRadius*e)},E=i?Math.min(1,Q*Xo):Math.min(Ho,Q*Ci*Xo*ki);Fi(F,s,h,m,T,_,E,oe,we,ve,e,i?Math.max(T,_):void 0),i||(Li(N,s,h,m,T,_,ve,Q,V,oe,Mi,we),Pi(N,ve,J,D,de,se,le,Math.min(.85,Si*Q))),P&&(k.globalCompositeOperation="lighter",k.drawImage(Fe,0,0),ae.globalCompositeOperation="lighter",ae.drawImage(gt,0,0))}for(const K of U)$i(k,ae,o,n,K,T,_,Y,e);k.globalCompositeOperation="source-over",ae.globalCompositeOperation="source-over"}}let ka=!1,Jo=0;function Xi(){ka||(ka=!0,!(typeof requestAnimationFrame>"u")&&requestAnimationFrame(e=>{ka=!1,!(e-Jo<Vn)&&(Jo=e,Pn())}))}const Ko="metal-fx-styles",Yi=`
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
`;let Ta=!1;function qi(){if(Ta||typeof document>"u")return;if(document.getElementById(Ko)){Ta=!0;return}const e=document.createElement("style");e.id=Ko,e.textContent=Yi,document.head.appendChild(e),Ta=!0}qi();const ji={position:"absolute",inset:0,width:"100%",height:"100%"},Qi={position:"absolute",inset:3},Ji={position:"absolute",inset:0,pointerEvents:"none",zIndex:3,borderRadius:"inherit"},Ki={position:"absolute",inset:0,pointerEvents:"none",zIndex:4},zt=new Map;function Zi(){const e=globalThis;e.__MFX_DEBUG__&&(e.__mfxGlow=zt)}yr((e,t)=>{const a=zt.get(e);return a?di(a.handles,e,t,e.opacityMul*e.glowGain,a.themeRef.current):!1});function es(e){const[t,a]=q.useState(()=>e!=="auto"?e:typeof window>"u"||!window.matchMedia||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");return q.useEffect(()=>{if(e!=="auto"){a(e);return}if(typeof window>"u"||!window.matchMedia)return;const n=window.matchMedia("(prefers-color-scheme: dark)"),o=()=>a(n.matches?"dark":"light");return o(),n.addEventListener("change",o),()=>n.removeEventListener("change",o)},[e]),t}const Za=q.forwardRef(function({children:e,variant:t="button",preset:a="chromatic",theme:n="auto",strength:o=1,glowGain:i=1,paused:r=!1,borderRadius:l,normalizeHostStyles:s=!0,reflectionTargets:c,disableGlow:u=!1,innerShadow:d,shaderScale:h,ringCssPx:m,scale:g=1,mask:p,glowMode:y="mask",className:b,style:v,...f},M){const w=q.useRef(null),O=q.useRef(null),L=q.useRef(null),I=q.useRef(null),B=q.useRef(null),Q=q.useRef(null),U=q.useRef(null),$=q.useRef(null),R=q.useRef("dark"),V=q.useRef(0),[J,Y]=q.useState(!1),T=es(n),_=q.useMemo(()=>ir(),[]);R.current=T;const k=t==="circle"?"circle":"pill",ae=!u;q.useImperativeHandle(M,()=>w.current,[]);const K=(P,F)=>{if(k==="circle")return Math.min(P,F)/2;const N=typeof l=="number"?l:(()=>{var z;const D=(z=Q.current)==null?void 0:z.firstElementChild;if(D){const de=parseFloat(getComputedStyle(D).borderTopLeftRadius);if(Number.isFinite(de)&&de>0)return de}return V.current})();return Math.min(N,Math.min(P,F)/2)};q.useEffect(()=>{_&&br(a,T)},[a,T,_]),q.useEffect(()=>{const P=U.current;P&&ft(P,{mask:p??null})},[p]),q.useEffect(()=>{const P=U.current;P&&ft(P,{paused:r})},[r]),q.useEffect(()=>{const P=U.current;if(!P)return;const F={};h!==void 0&&(F.shaderScale=h),m!==void 0&&(F.ringCssPx=m),g!==void 0&&(F.scale=g),Object.keys(F).length>0&&ft(P,F)},[h,m,g]),q.useLayoutEffect(()=>{const P=O.current,F=w.current,N=L.current;if(!P||!F||!_)return;{const E=getComputedStyle(F),H=parseFloat(E.borderTopLeftRadius);V.current=Number.isFinite(H)?H:0}const z=()=>{const E=F.getBoundingClientRect(),H=Math.max(1,Math.round(E.width)),Z=Math.max(1,Math.round(E.height));return{cssWidth:H,cssHeight:Z,cornerRadius:K(H,Z)}},D=z();U.current=fr({onComposite:()=>{const E=U.current,H=$.current;E&&H&&ui(H,E.deform);const Z=B.current;E&&Z&&En(Z,E.deform)},hostCanvas:P,cssWidth:D.cssWidth,cssHeight:D.cssHeight,cornerRadius:D.cornerRadius,kind:k,paused:r,shaderScale:h,ringCssPx:m,scale:g,mask:p??null,onFirstCopy:()=>Y(!0)}),F.style.setProperty("--mfx-radius",`${D.cornerRadius}px`),F.style.borderRadius=`${D.cornerRadius}px`;const de=(E,H)=>{if(!p||y==="ring")return{};const Z=window.devicePixelRatio||1,fe=document.createElement("canvas");fe.width=Math.max(1,Math.round(E*Z)),fe.height=Math.max(1,Math.round(H*Z));const it=fe.getContext("2d");if(!it)return{};it.fillStyle="#fff",p(it,fe.width,fe.height,Z);const st=it.getImageData(0,0,fe.width,fe.height).data,Xt=[],Ue=Math.max(1,Math.round(2*Z));for(let lt=Ue>>1;lt<fe.height;lt+=Ue)for(let Ae=Ue>>1;Ae<fe.width;Ae+=Ue)st[(lt*fe.width+Ae)*4+3]>128&&Xt.push({x:Ae/Z,y:lt/Z});return{samplePoints:Xt,maskDataUrl:fe.toDataURL("image/png")}};N&&($.current=Uo(N,{width:D.cssWidth,height:D.cssHeight,cornerRadius:D.cornerRadius,kind:k,scale:g,...de(D.cssWidth,D.cssHeight)}));const se=E=>{if(!N)return;const H=$.current;N.innerHTML="",$.current=Uo(N,{width:E.cssWidth,height:E.cssHeight,cornerRadius:E.cornerRadius,kind:k,scale:g,...de(E.cssWidth,E.cssHeight)}),H&&fi(H,$.current);const Z=U.current;Z&&$.current&&zt.set(Z,{handles:$.current,themeRef:R})},le=()=>d?d===!0?zo:{...zo,...d}:null,oe=E=>{const H=I.current,Z=U.current;$o(B.current),B.current=null;const fe=le();!H||!Z||!fe||(B.current=mi(H,{width:E.cssWidth,height:E.cssHeight,cornerRadius:E.cornerRadius,kind:k,ring:Z.ringCssPx},fe))};oe(D);let he=0,ue=D.cssWidth,ne=D.cssHeight,A=D.cornerRadius;const G=new ResizeObserver(()=>{he===0&&(he=requestAnimationFrame(()=>{he=0;const E=z(),H=U.current;!H||Math.abs(E.cssWidth-ue)<.5&&Math.abs(E.cssHeight-ne)<.5&&Math.abs(E.cornerRadius-A)<.5||(ue=E.cssWidth,ne=E.cssHeight,A=E.cornerRadius,ft(H,{cssWidth:E.cssWidth,cssHeight:E.cssHeight,cornerRadius:E.cornerRadius}),F.style.setProperty("--mfx-radius",`${E.cornerRadius}px`),F.style.borderRadius=`${E.cornerRadius}px`,se(E),oe(E))}))});G.observe(F);let W=null;const re=()=>{const E=U.current;if(E&&vr(E)){const H=z();se(H),oe(H)}Se()},Se=()=>{W==null||W.removeEventListener("change",re),W=typeof window.matchMedia=="function"?window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`):null,W==null||W.addEventListener("change",re)};Se();const we=Tr(E=>{E&&U.current&&se(z())});let ve=null;return typeof IntersectionObserver<"u"&&(ve=new IntersectionObserver(E=>{const H=U.current;if(H)for(const Z of E)xr(H,Z.isIntersecting)},{rootMargin:"64px"}),ve.observe(F)),U.current&&$.current&&(zt.set(U.current,{handles:$.current,themeRef:R}),pr(U.current)),Fr(),Zi(),()=>{Lr(),$o(B.current),B.current=null,G.disconnect(),W==null||W.removeEventListener("change",re),ve==null||ve.disconnect(),we(),he!==0&&cancelAnimationFrame(he);const E=U.current;E&&(zt.delete(E),gr(E),mr(E)),U.current=null,$.current=null,N&&(N.innerHTML="")}},[k]),q.useEffect(()=>{const P=U.current;P&&ft(P,{opacityMul:Math.max(0,Math.min(1,o)),glowGain:Math.max(0,i)})},[o,i,t]),q.useEffect(()=>{const P=U.current,F=w.current;if(!P||!F||!c||T!=="dark")return;P.onAfterFrame=Xi;const N=c.flatMap(z=>{const D="current"in z?z:z.ref,de="current"in z?1:z.strength??1;return D.current?[{el:D.current,strength:de}]:[]});for(const{el:z,strength:D}of N)Gi(z,P,F,D);return()=>{P.onAfterFrame=void 0;for(const{el:z}of N)Wi(z)}},[c,T]),q.useEffect(()=>{const P=w.current,F=U.current;if(!P||!F)return;const N=K(F.cssWidth,F.cssHeight);ft(F,{cornerRadius:N}),P.style.setProperty("--mfx-radius",`${N}px`),P.style.borderRadius=`${N}px`},[l,T,t,k]);const ee=q.useMemo(()=>({...v,"--mfx-strength":String(Math.min(1,Math.max(0,o))),opacity:J?1:0,visibility:J?"visible":"hidden",transition:J?"opacity 0.15s ease-out":"none"}),[v,o,J]);return _?xe.jsxs("div",{...f,ref:w,className:b?`metal-fx-root ${b}`:"metal-fx-root","data-variant":t,"data-shape":k,"data-theme":T,"data-paused":r?"true":void 0,"data-normalize":s?"true":"false",style:ee,children:[xe.jsx("canvas",{ref:O,className:"metal-fx-canvas",style:ji}),xe.jsx("div",{className:"metal-fx-inner","aria-hidden":"true",style:Qi}),xe.jsx("div",{ref:L,"aria-hidden":"true",style:{...Ji,display:ae?void 0:"none"}}),d?xe.jsx("div",{ref:I,"aria-hidden":"true",style:Ki}):null,xe.jsx("div",{ref:Q,className:"metal-fx-content",children:e})]}):xe.jsx("div",{...f,ref:w,className:b?`metal-fx-fallback ${b}`:"metal-fx-fallback","data-metal-fx-unsupported":"",style:{display:"inline-flex",...v},children:e})});Za.displayName="MetalFx";function eo(e,t,a,n){const o=getComputedStyle(a),i=t.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(a);const l=r.getBoundingClientRect();r.detach(),e.save(),e.scale(n,n),e.font=`${o.fontStyle} ${o.fontWeight} ${o.fontSize} ${o.fontFamily}`,e.textAlign="left",e.textBaseline="alphabetic";const s=a.textContent??"",c=e.measureText(s),u=c.fontBoundingBoxAscent??parseFloat(o.fontSize)*.9,d=c.fontBoundingBoxDescent??parseFloat(o.fontSize)*.2,h=l.left-i.left,m=l.top-i.top+(l.height-(u+d))/2+u;e.fillText(s,h,m),e.restore()}function ts(e,t){const a=window.devicePixelRatio||1,n=e.getBoundingClientRect(),o=document.createElement("canvas");o.width=Math.max(1,Math.round(n.width*a)),o.height=Math.max(1,Math.round(n.height*a));const i=o.getContext("2d");return i?(i.fillStyle="#fff",eo(i,e,t,a),o.toDataURL("image/png")):null}const Un={offsetY:1,blur:.5,alpha:.9},Ea=Object.freeze({metalOpacity:.62,shaderScale:2.8,glowGain:2.5,innerShadow:Un});function as(e,t,a,n){const o=window.devicePixelRatio||1,i=t.getBoundingClientRect(),r=Math.max(1,Math.round(i.width*o)),l=Math.max(1,Math.round(i.height*o)),s=document.createElement("canvas");s.width=r,s.height=l;const c=s.getContext("2d",{willReadFrequently:!0}),u=e.getContext("2d");if(!c||!u)return;c.fillStyle="#fff",eo(c,t,a,o);const d=c.getImageData(0,0,r,l).data,h=r*l,m=new Float32Array(h);for(let f=0,M=3;f<h;f++,M+=4)m[f]=d[M]/255;const g=Math.max(1,Math.round(n.offsetY*o))*r,p=new Float32Array(h);for(let f=0;f<h;f++){const M=f>=g?m[f-g]:0;p[f]=Math.max(0,m[f]-M)}const y=ca(p,r,l,n.blur*o);e.width=r,e.height=l,e.style.width=`${i.width}px`,e.style.height=`${i.height}px`;const b=u.createImageData(r,l),v=b.data;for(let f=0,M=0;f<h;f++,M+=4)v[M]=255,v[M+1]=255,v[M+2]=255,v[M+3]=Math.round(Math.min(1,y[f]*m[f]*n.alpha)*255);u.putImageData(b,0,0)}const Zo="mfx-bare-style",os=".metal-fx-root[data-mfx-bare]{background:transparent!important}.metal-fx-root[data-mfx-bare]::before,.metal-fx-root[data-mfx-bare]::after{box-shadow:none!important}.metal-fx-root[data-mfx-bare] .metal-fx-inner{display:none!important}";function Ms({children:e,font:t,color:a,strength:n=1,theme:o,reflectionTargets:i,className:r,innerShadow:l=Un,glow:s=!1,glowGain:c=Ea.glowGain,metalOpacity:u=Ea.metalOpacity,shaderScale:d=Ea.shaderScale}){const h=q.useRef(null),m=q.useRef(null);q.useEffect(()=>{var y,b,v,f;if(!document.getElementById(Zo)){const O=document.createElement("style");O.id=Zo,O.textContent=os,document.head.appendChild(O)}(y=h.current)==null||y.setAttribute("data-mfx-bare","");const M=(b=h.current)==null?void 0:b.querySelector("canvas.metal-fx-canvas");M&&(M.style.zIndex="6");const w=(f=(v=h.current)==null?void 0:v.querySelector(".metal-fx-glow-svg"))==null?void 0:f.parentElement;w&&(w.style.zIndex="7")},[]),q.useEffect(()=>{var y;const b=h.current,v=m.current;if(!b||!v||!l)return;const f=document.createElement("canvas");f.className="metal-fx-text-rim",f.setAttribute("aria-hidden","true"),f.style.cssText="position:absolute;left:0;top:0;pointer-events:none;z-index:8",b.appendChild(f);const M=()=>as(f,b,v,l);M();let w=!0;(y=document.fonts)==null||y.ready.then(()=>{w&&M()});const O=new ResizeObserver(M);O.observe(b);let L=null;const I=()=>{L==null||L.removeEventListener("change",B),L=typeof window.matchMedia=="function"?window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`):null,L==null||L.addEventListener("change",B)},B=()=>{w&&(M(),I())};return I(),()=>{w=!1,O.disconnect(),L==null||L.removeEventListener("change",B),f.remove()}},[l]);const g=q.useCallback((y,b,v,f)=>{const M=h.current,w=m.current;M&&w&&eo(y,M,w,f)},[]),p={font:t,color:a,letterSpacing:0,whiteSpace:"nowrap"};return xe.jsx(Za,{ref:h,preset:"chromatic",theme:o,strength:n*u,glowGain:c,disableGlow:!s,mask:g,reflectionTargets:i,shaderScale:d,borderRadius:4,style:{background:"transparent",borderRadius:4},children:xe.jsx("span",{ref:m,className:r,style:p,"aria-label":e,children:e})})}const pt=55.556,Xa=45,en=25,ns=26.667,tn=(Xa-ns)/2,an={position:"absolute",inset:0,pointerEvents:"none"},rs=(e,t)=>`inset 0px 0px ${8.333*e}px 0px rgba(255,255,255,${t}), inset 0px 0px ${8.333*e}px 0px rgba(255,255,255,${t}), inset 0px 0px 0px ${.833*e}px rgba(255,255,255,0.5), inset 0px ${.833*e}px 0px 0px rgba(255,255,255,0.78)`,Bt=Object.freeze({metalOpacity:.8,shaderScale:1.6,core:Object.freeze({r:46,blur:100,a:.94,size:49}),gradient:0,glow:.41});function _s({children:e="New",strength:t=1,theme:a,scale:n=1,reflectionTargets:o,metalOpacity:i=Bt.metalOpacity,shaderScale:r=Bt.shaderScale,core:l=Bt.core,gradient:s=Bt.gradient,glow:c=Bt.glow,textColor:u="#323232"}){const d=q.useRef(null),h=i,m=q.useCallback((g,p,y,b)=>{g.beginPath(),g.roundRect(0,0,p,y,pt*b),g.fill()},[]);return xe.jsx(Za,{ref:d,preset:"chromatic",theme:a,strength:t*h,shaderScale:r,mask:m,glowMode:"ring",reflectionTargets:o,borderRadius:pt*n,style:{background:"#ffffff",borderRadius:pt*n},children:xe.jsxs("div",{style:{position:"relative",width:Xa*n,height:en*n,borderRadius:pt*n},children:[xe.jsx("div",{"aria-hidden":"true",style:{...an,borderRadius:pt*n,background:`radial-gradient(ellipse ${l.size}% ${l.size}% at 50% 50%, rgba(255,255,255,1) ${l.r}%, rgba(255,255,255,0) ${Math.min(100,l.r+l.blur)}%)`,opacity:l.a}}),xe.jsx("div",{"aria-hidden":"true",style:{...an,borderRadius:pt*n,background:`linear-gradient(to bottom, rgba(255,255,255,${s}), rgba(255,255,255,0))`,boxShadow:rs(n,c)}}),xe.jsx("span",{style:{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",width:Xa*n,height:en*n,paddingLeft:tn*n,paddingRight:tn*n,font:`600 ${12.222*n}px/1.4 Inter, sans-serif`,color:u,letterSpacing:0,whiteSpace:"nowrap"},"aria-label":e,children:e})]})})}const Nn=Object.freeze({enabled:!0,applyTo:"ring",strength:.74,fadeInMs:200,fadeOutMs:350,smoothMs:140,reach:36,blob:13,liquidBlob:10,maxDisp:9,gain:.6,pressGain:.55,pullGain:.49,press:5,liquid:7.5,liquidReach:8,liquidStiffness:53,liquidDamping:9,stiffness:260,damping:13,mass:1,follow:.32,mapRes:2,smooth:.25}),to={...Nn};function Ss(e){Object.assign(to,e)}function Rs(){Object.assign(to,Nn)}function Cs(e,t=()=>to){q.useEffect(()=>{const a=e.current;if(!a||typeof document>"u")return;const n=a.querySelector("canvas.metal-fx-canvas"),o=a.querySelector(".metal-fx-inner");let i=null,r=null,l=!1,s=!1,c=0,u=0,d=0,h=0,m=0,g=0,p=0,y=0,b=0,v=0,f=0,M=0,w=0,O=0,L=0,I=0,B=0,Q=0,U=NaN,$=NaN,R=NaN,V=NaN,J=NaN,Y=0,T=0,_=0,k=1,ae=1;const K=(j,S,te)=>{const pe=j-c,me=S-u,be=pe*pe+me*me,ke=Math.exp(-be/k),Ne=Math.exp(-be/ae);te.x=Y*ke+pe*_*Ne,te.y=T*ke+me*_*Ne},ee={x:0,y:0},P=(j,S,te)=>{K(j,S,ee),te.x=j+ee.x,te.y=S+ee.y},F="mfx-bend-style";if(!document.getElementById(F)){const j=document.createElement("style");j.id=F,j.textContent=".metal-fx-root[data-mfx-bend]::before,.metal-fx-root[data-mfx-bend]::after{box-shadow:none!important}",document.head.appendChild(j)}let N=!1,z=null;const D=a.style.background,de=(o==null?void 0:o.style.visibility)??"",se=j=>{if(!j||j==="none")return null;const S=j.match(/^(rgba?\([^)]*\)|#[0-9a-fA-F]+|[a-z]+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/);return S?{color:S[1],spread:Math.abs(parseFloat(S[5]))}:null},le=j=>{if(N||!n)return;const S=se(getComputedStyle(a,"::after").boxShadow),te=o?se(getComputedStyle(o).boxShadow):null,pe=o&&parseFloat(getComputedStyle(o).inset)||0;z={fill:getComputedStyle(a).backgroundColor,rim:S&&S.spread>0?{inset:0,width:S.spread,color:S.color}:null,hairline:te&&te.spread>0?{inset:pe,width:te.spread,color:te.color}:null},a.style.background="transparent",a.setAttribute("data-mfx-bend",""),o&&(o.style.visibility="hidden"),yo(n,P,z,j),N=!0},oe=()=>{!N||!n||(yo(n,null,null,0),a.style.background=D,a.removeAttribute("data-mfx-bend"),o&&(o.style.visibility=de),N=!1)},he=`mfx-bend-${Math.random().toString(36).slice(2,8)}`,ue="http://www.w3.org/2000/svg",ne=.75,A=document.createElementNS(ue,"svg");A.setAttribute("aria-hidden","true"),A.style.cssText="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";const G=document.createElementNS(ue,"filter");G.setAttribute("id",he),G.setAttribute("x",`-${ne*100}%`),G.setAttribute("y",`-${ne*100}%`),G.setAttribute("width",`${(1+2*ne)*100}%`),G.setAttribute("height",`${(1+2*ne)*100}%`),G.setAttribute("color-interpolation-filters","sRGB");const W=document.createElementNS(ue,"feFlood");W.setAttribute("flood-color","rgb(128,128,0)"),W.setAttribute("flood-opacity","1"),W.setAttribute("result","neutral");const re=document.createElementNS(ue,"feImage");re.setAttribute("result","img"),re.setAttribute("preserveAspectRatio","none");const Se=document.createElementNS(ue,"feComposite");Se.setAttribute("in","img"),Se.setAttribute("in2","neutral"),Se.setAttribute("operator","over"),Se.setAttribute("result","map");const we=document.createElementNS(ue,"feDisplacementMap");we.setAttribute("in","SourceGraphic"),we.setAttribute("in2","map"),we.setAttribute("xChannelSelector","R"),we.setAttribute("yChannelSelector","G"),we.setAttribute("result","bent");const ve=document.createElementNS(ue,"feGaussianBlur");ve.setAttribute("in","bent"),ve.setAttribute("stdDeviation","0");for(const j of[W,re,Se,we,ve])G.appendChild(j);A.appendChild(G),document.body.appendChild(A);const E=document.createElement("canvas"),H=E.getContext("2d",{alpha:!1,willReadFrequently:!0});let Z=null,fe=null;const it=4278222976;let st=!1;const Xt=a.style.filter,Ue=()=>{st&&(a.style.filter=Xt,st=!1)},lt=(j,S,te,pe)=>{if(!H)return;const me=Math.max(.25,j.mapRes),be=-S*ne,ke=-te*ne,Ne=S*(1+2*ne),Oe=te*(1+2*ne),ye=Math.max(2,Math.round(Ne*me)),ze=Math.max(2,Math.round(Oe*me));(E.width!==ye||E.height!==ze||!Z||!fe)&&(E.width=ye,E.height=ze,Z=H.createImageData(ye,ze),fe=new Uint32Array(Z.data.buffer)),fe.fill(it);const ct=Z.data,De=3*Math.max(j.blob,j.liquidBlob),jt=Math.max(0,Math.floor((c-De-be)*me)),kt=Math.min(ye-1,Math.ceil((c+De-be)*me)),da=Math.max(0,Math.floor((u-De-ke)*me)),ha=Math.min(ze-1,Math.ceil((u+De-ke)*me)),Qt=255/pe;for(let $e=da;$e<=ha;$e++){const Tt=ke+($e+.5)/me;let Je=($e*ye+jt)*4;for(let ut=jt;ut<=kt;ut++,Je+=4){const Jt=be+(ut+.5)/me;K(Jt,Tt,ee);let Be=127.5-ee.x*Qt;Be=Be<0?0:Be>255?255:Be;let Ke=127.5-ee.y*Qt;Ke=Ke<0?0:Ke>255?255:Ke,ct[Je]=Be,ct[Je+1]=Ke}}H.putImageData(Z,0,0),re.setAttribute("x",be.toFixed(2)),re.setAttribute("y",ke.toFixed(2)),re.setAttribute("width",Ne.toFixed(2)),re.setAttribute("height",Oe.toFixed(2)),re.setAttribute("href",E.toDataURL("image/png")),we.setAttribute("scale",pe.toFixed(2)),ve.setAttribute("stdDeviation",Math.max(0,j.smooth).toFixed(3)),st||(a.style.filter=`url(#${he})`,st=!0)},Ae=()=>{I===0&&(B=performance.now(),I=requestAnimationFrame(ao))},ao=j=>{I=0;const S=t(),te=Math.min(.032,Math.max(.001,(j-B)/1e3));B=j;const pe=a.getBoundingClientRect(),me=pe.width,be=pe.height,ke=me/2,Ne=be/2;let Oe=0,ye=0;if(M=0,S.enabled&&i){const Ze=i.x-pe.left,fa=i.y-pe.top,ro=Ze-ke,io=fa-Ne,Ve=Math.hypot(ro,io),so=Math.min(me,be)/2,lo=Math.max(me,be)/2+S.reach,Dn=s;s=Ve<lo;const ma=Math.max(0,1-Math.abs(Ve-so)/Math.max(1,S.liquidReach));if(M=ma*ma*(3-2*ma),s){Dn||(c=Ze,u=fa);const co=1-Math.pow(1-Math.min(.999,S.follow),te*60);c+=(Ze-c)*co,u+=(fa-u)*co;const uo=1-Math.max(0,(Ve-(lo-S.reach))/S.reach);Oe=O*(S.gain/100)*uo,ye=L*(S.gain/100)*uo;const ho=Ve>.001?ro/Ve:0,fo=Ve>.001?io/Ve:0,pa=so-Ve;if(pa>0){const Et=pa*S.pressGain;Oe-=ho*Et,ye-=fo*Et}else{const Et=-pa,xa=Math.max(0,1-Et/Math.max(1,S.reach)),mo=Et*S.pullGain*(xa*xa*(3-2*xa));Oe+=ho*mo,ye+=fo*mo}const ga=Math.hypot(Oe,ye);ga>S.maxDisp&&(Oe*=S.maxDisp/ga,ye*=S.maxDisp/ga)}}else s=!1;O*=Math.exp(-te*12),L*=Math.exp(-te*12);const ze=1-Math.exp(-(te*1e3)/Math.max(1,S.smoothMs));b+=(Oe-b)*ze,v+=(ye-v)*ze;const ct=Math.max(.05,S.mass);m+=(-S.stiffness*(d-b)-S.damping*m)/ct*te,g+=(-S.stiffness*(h-v)-S.damping*g)/ct*te,d+=m*te,h+=g*te;const De=l&&s&&S.enabled?S.press:0,jt=s&&S.enabled?S.liquid*(M+(l?.5:0)):0;f+=(jt-f)*ze,y+=(-S.liquidStiffness*(p-f)-S.liquidDamping*y)/ct*te,p+=y*te;const kt=s&&S.enabled?1:0,da=Math.max(1,kt?S.fadeInMs:S.fadeOutMs)/3;w+=(kt-w)*(1-Math.exp(-(te*1e3)/da)),w<.002&&kt===0&&(w=0);const ha=Math.hypot(d,h),Qt=!s&&w===0&&ha<.05&&Math.hypot(m,g)<1&&Math.abs(p)<.05&&De===0;if(S.applyTo==="ring"?Ue():oe(),Qt){d=h=m=g=p=y=0,b=v=f=0,U=$=R=V=J=NaN,oe(),Ue();return}const $e=Math.max(0,S.strength)*w;let Tt=ke-c,Je=Ne-u;const ut=Math.hypot(Tt,Je)||1;Tt/=ut,Je/=ut;const Jt=Math.max(.5,S.blob),Be=Math.max(.5,S.liquidBlob);k=2*Jt*Jt,ae=2*Be*Be,Y=(d+Tt*De)*$e,T=(h+Je*De)*$e,_=p/Be*$e;const Ke=!(Math.abs(d-U)<.05&&Math.abs(h-$)<.05&&Math.abs(p-R)<.05&&Math.abs(c-V)<.05&&Math.abs(u-J)<.05),zn=j-Q>=1e3/60-.5;if(Ke&&zn)if(Q=j,U=d,$=h,R=p,V=c,J=u,S.applyTo==="ring"&&n){const Ze=Math.ceil((S.maxDisp+S.liquid*1.5)*Math.max(1,S.strength))+4;le(Ze),wr(n)}else{const Ze=Math.max(1,(S.maxDisp+S.liquid*1.5)*2*Math.max(1,S.strength));lt(S,me,be,Ze)}else S.applyTo==="ring"&&n&&!N&&le(Math.ceil((S.maxDisp+S.liquid*1.5)*Math.max(1,S.strength))+4);I=requestAnimationFrame(ao)},oo=j=>{const S=performance.now();if(r){const te=Math.max(.004,(S-r.t)/1e3),pe=1-Math.exp(-te/.04);O+=((j.clientX-r.x)/te-O)*pe,L+=((j.clientY-r.y)/te-L)*pe}r={x:j.clientX,y:j.clientY,t:S},i={x:j.clientX,y:j.clientY},Ae()},Yt=()=>{i=null,r=null,Ae()},no=()=>{l=!0,Ae()},qt=()=>{l=!1,Ae()};return document.addEventListener("pointermove",oo,{passive:!0}),document.addEventListener("pointerleave",Yt),window.addEventListener("blur",Yt),a.addEventListener("pointerdown",no),document.addEventListener("pointerup",qt),document.addEventListener("pointercancel",qt),()=>{I!==0&&cancelAnimationFrame(I),document.removeEventListener("pointermove",oo),document.removeEventListener("pointerleave",Yt),window.removeEventListener("blur",Yt),a.removeEventListener("pointerdown",no),document.removeEventListener("pointerup",qt),document.removeEventListener("pointercancel",qt),oe(),Ue(),A.parentNode&&A.parentNode.removeChild(A)}},[e,t])}function ks(e){q.useEffect(()=>{var t;const a=e.current;if(!a)return;a.setAttribute("data-metal-fx-text","");let n=0,o=!1,i=0;const r=()=>{if(o)return;const c=a.querySelector(":scope > [data-metal-fx-reflection]");if(!c){i++<300&&(n=requestAnimationFrame(r));return}i=0;const u=ts(a,a);if(!u)return;const d=`url("${u}")`;c.style.maskImage=d,c.style.webkitMaskImage=d,c.style.maskRepeat="no-repeat",c.style.webkitMaskRepeat="no-repeat",c.style.maskSize="100% 100%",c.style.webkitMaskSize="100% 100%",c.style.mixBlendMode="normal"};r();const l=new ResizeObserver(()=>r());l.observe(a),(t=document.fonts)==null||t.ready.then(()=>r());const s=new MutationObserver(c=>{for(const u of c)for(const d of Array.from(u.addedNodes))if(d instanceof HTMLElement&&d.hasAttribute("data-metal-fx-reflection")){r();return}});return s.observe(a,{childList:!0}),()=>{o=!0,n&&cancelAnimationFrame(n),l.disconnect(),s.disconnect()}},[e])}export{to as BEND,Nn as BEND_DEFAULTS,He as CURSOR_LIGHT,vn as CURSOR_LIGHT_DEFAULTS,qn as FIT_CONTAIN,fs as FIT_COVER,hs as FIT_NONE,C as GLOW,xn as GLOW_DEFAULTS,Cr as GLOW_MARKUP_KEYS,Bt as METAL_BADGE_DEFAULTS,Ea as METAL_TEXT_DEFAULTS,_s as MetalBadge,Za as MetalFx,Ms as MetalText,rn as PRESETS,Ht as REFLECTION_OCCLUDER,Fn as REFLECTION_OCCLUDER_DEFAULTS,zo as RIM_DEFAULTS,ls as SHAPE_CIRCLE,cs as SHAPE_DAISY,us as SHAPE_DIAMOND,ds as SHAPE_METABALLS,Yn as SHAPE_NONE,fr as createInstance,mr as destroyInstance,ps as getSharedPreset,ss as hexToRgb,po as hexToRgba,ir as isMetalFxSupported,eo as paintTextRun,gs as pauseShared,wr as redrawInstance,Rs as resetBendConfig,ws as resetCursorLightConfig,vs as resetGlowConfig,ys as resetReflectionOccluderConfig,xs as resumeShared,Ss as setBendConfig,Er as setCursorLightConfig,bs as setCursorSprite,kr as setGlowConfig,yo as setInstanceDeform,zi as setReflectionOccluderConfig,br as setSharedPreset,ms as setSharedPresetMode,Tr as subscribeGlowConfig,ts as textMaskDataUrl,ft as updateInstance,Cs as useMetalBend,ks as useMetalTextReflection};
