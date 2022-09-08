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
    background: #4D88FF;
    border-radius: 4px;
    border: 1px solid #4D88FF;
    color: #fff;
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
