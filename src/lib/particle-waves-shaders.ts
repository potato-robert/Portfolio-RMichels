export const particleWavesVertexShader = `
attribute float scale;
attribute vec2 gridIndex;
uniform float uCount;
uniform float uWaveAnimate;

void main() {
  vec3 pos = position;
  float ptScale = scale;

  if ( uWaveAnimate > 0.5 ) {
    float ix = gridIndex.x;
    float iy = gridIndex.y;
    pos.y = sin( ( ix + uCount ) * 0.3 ) * 200.0 + sin( ( iy + uCount ) * 0.5 ) * 100.0;
    ptScale = ( sin( ( ix + uCount ) * 0.3 ) + 1.0 ) * 8.0 + ( sin( ( iy + uCount ) * 0.5 ) + 1.0 ) * 1.0;
  }

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  gl_PointSize = ptScale * ( 300.0 / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const particleWavesFragmentShader = `
uniform vec3 color;
void main() {
  if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
  gl_FragColor = vec4( color, 1.0 );
}
`;
