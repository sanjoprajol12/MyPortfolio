# Vue Snotify for Vue 3
Based on [vue-snotify](https://github.com/artemsky/vue-snotify) for Vue 2.

# How to use
npm i --save vue3-notify

In main.ts : 
```ts
import notify from 'vue3-notification';

const app = createApp(App)

app.use(notify);

app.mount('#app');
```
In App.vue:
```html
<vue3-notify />
```
## Vue Options API:
```js
methods: {
    handleClick() {
      this.$snotify.success("Lorem ipsum dolor sit amet!");
    }
}
```
## Inject function for Vue files
The plugin automatically sets global provide() with key "vue3-notify".
```js
<script setup>
import { inject } from "vue";

const snotify: (any) = inject("vue3-notify");

function handleClick() {
    handleClick() {
       snotify.success("Lorem ipsum dolor sit amet!");
    }
};

</script>
```