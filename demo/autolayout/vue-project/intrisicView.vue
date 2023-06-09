<template>
    <div :component-name="name" class="componentBackground dynamicContent">
        <div v-for="c in list">
            {{c}}
        </div>
        <div>
            <button @click="changeList">change list!</button>
        </div>
    </div>
</template>
<script>

const genContent = () => Array(parseInt(Math.random() * 10) + 2).fill(1).map(() => Array(parseInt(Math.random() * 20) + 5).fill('xx').join(''));
export default {
    props: {
        name: String,
    },
    data() {
        const list = genContent();
        console.log(list);
        return {
            list,
        }
    },
    mounted() {
        // setTimeout(() => {
        //     this.list = genContent();
        // }, 1000);
    },
    methods: {
        changeList() {
            this.list = genContent();
        }
    }
}
</script>
<style>
.dynamicContent {
    
}
</style>

