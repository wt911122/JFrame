<template>
  <button class="btn"><span>{{ content }}</span></button>
</template>

<script>
export default {
    props: {
        content: String
    }
}
</script>

<style scoped>
.btn {
    display: inline-flex;
    background: transparent;
    border-radius: 4px;
    border: 1px solid transparent;
    color: #000;
    box-sizing: border-box;
    width: 64px;
    height: 24px;
    outline: none;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
}
</style>
