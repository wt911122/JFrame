<template>
    <div ref="root" :component-name="name" class="componentBackground">
        <slot></slot>
    </div>
</template>
<script>
import ConstraintLayout from '../model/constraints';
function keyGen(key) {
    return `[component-name="${key}"]`
}

export default {
    props: {
        constraints: {
            type: Array,
            default: [],
        },
        name: String,
    },
    watch: {
        constraints(val) {
            this.$nextTick(() => {
                this.reflow();
            })
        }
    },
    mounted() {
        this.layout = new ConstraintLayout({
            root: this.$refs.root,
            getChild(root, component) {
                return root.querySelector(keyGen(component));
            },
        });
        this.reflow();
    },
    beforeDestroy() {
        this.layout.cleanObserver();
    },
    methods: {
        reflow() {
            const root = this.$refs.root;
            if(this.$slots.default && this.$slots.default.length > 0) {
                console.log('beforeDestroy')
                this.layout.cleanConstraint();
                console.log(this.constraints)
                this.layout.setConstraint(this.constraints);
                this.layout.reflow();
                this.layout.scheduleResize();
                // autoLayout(root, this.constraints);
            }
        }
    }
}


</script>

<style>
.autolayout{
    /* transition: all .3s; */
}
.componentBackground{
    background-size: 100% auto;
    background-repeat: no-repeat;
}
</style>