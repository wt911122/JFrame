<template>
    <div :component-name="name" class="componentBackground dynamicContent">
        <div v-for="c in list">
            {{c}}
        </div>
    </div>
</template>
<script>
export default {
    props: {
        name: String,
    },
    data() {
        const list = Array(parseInt(Math.random(20)) + 5).fill(1).map(() => 'xxxxxx');
        console.log(list);
        return {
            list,
        }
    }
}
</script>
<style>
.dynamicContent {
    
}
</style>

