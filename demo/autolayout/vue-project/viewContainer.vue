<template>
    <div :component-name="name">
        <slot></slot>
    </div>
</template>
<script>
export default {
    props: {
        name: String,
    }
}
</script>