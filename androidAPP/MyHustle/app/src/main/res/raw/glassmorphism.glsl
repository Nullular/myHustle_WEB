uniform shader iChannel0;
uniform float2 iResolution;
uniform float iTime;

const int SAMPLES = 64;
const float RADIUS = 0.025;

float rand(float2 co) {
    return fract(sin(dot(co.xy, float2(12.9898,78.233))) * 43758.5453);
}

half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;

    float3 color = float3(0.0);
    float total = 0.0;

    for (int i = 0; i < SAMPLES; ++i) {
        float angle = float(i) * 6.28318 / float(SAMPLES);
        float r = RADIUS * (0.5 + rand(uv + float2(iTime, angle)) * 0.5);
        float2 offset = float2(cos(angle), sin(angle)) * r;

        color += iChannel0.eval(uv + offset).rgb;
        total += 1.0;
    }

    color /= total;

    return half4(color, 1.0);
}
