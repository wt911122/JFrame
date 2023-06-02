<template>
    <div :component-name="name" class="componentBackground">
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

