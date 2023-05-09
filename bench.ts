import {
    randomString,
    randomStringBase,
    randomStringA,
    randomStringB,
    randomStringC,
} from './lib.ts'; 

Deno.bench("randomStringBase", { group: "timing", baseline: true }, () => {
    randomStringBase();
});

Deno.bench("randomStringA", { group: "timing" }, () => {
    randomStringA();
});

Deno.bench("randomStringB", { group: "timing" }, () => {
    randomStringB();
});

Deno.bench("randomStringC", { group: "timing" }, () => {
    randomStringC();
});

Deno.bench("randomString", { group: "timing" }, () => {
    randomString();
});