<template>
    <div class="container" :direction="direction">
        <div v-if="isContainer" 
            class="floatContainer" 
            :direction="containerDirection"
            :justify="justify"
            :alignment="alignment">
            <slot></slot>
        </div>
        <slot v-else></slot>
    </div>
</template>

<script>
export default {
    props: {
        direction: String,
        isContainer: Boolean,
        containerDirection: String,
        justify: String,
        alignment: String,
    }
}
</script>

<style scoped>
.container{
    display: grid;
    background: #fff;
    box-sizing: border-box;
    /* outline: 1px solid #fff; */
    border: 2px solid #fff
}
.container[direction="row"] {
    grid-template-rows: 1fr;
}
.container[direction="column"] {
    grid-template-columns: 1fr;
}
.floatContainer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0;
    justify-content: flex-start;
    align-items: flex-start;
    height: max-content;
}
.floatContainer[justify="start"] {
    justify-content: flex-start;
}
.floatContainer[justify="center"] {
    justify-content: center;
}
.floatContainer[justify="end"] {
    justify-content: flex-end;
}
.floatContainer[alignment="start"] {
    align-items: flex-start;
}
.floatContainer[alignment="center"] {
    align-items: center;
}
.floatContainer[alignment="end"] {
    align-items: flex-end;
}
.floatContainer[direction='row'] {
    width: 100%;
    height: max-content;
    flex-direction: row;
}
.floatContainer[direction='column'] {
    width: max-content;
    height: 100%;
    flex-direction: column;
}
</style>