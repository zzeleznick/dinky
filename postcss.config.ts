import autoprefixer from "npm:autoprefixer";
import csso from "https://esm.sh/postcss-csso@6.0.1";
import customMediaPlugin from "https://esm.sh/postcss-custom-media@9.1.3";
import postcssPresetEnv from "https://esm.sh/postcss-preset-env@8.3.2";

export const config = {
  plugins: [
    customMediaPlugin(),
    postcssPresetEnv({
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-media-queries": true,
        "media-query-ranges": true,
      },
    }),
    autoprefixer(),
    csso(),
  ],
};