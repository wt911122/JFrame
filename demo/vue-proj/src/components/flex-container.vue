<template>
    <div class="container" :direction="direction">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        direction: String,
        
    }
}
</script>

<style scoped>
.container{
    display: flex;
}
.container[direction="row"] {
    flex-direction: row;
}
.container[direction="column"] {
    flex-direction: column;
}
</style>