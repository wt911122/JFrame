<template>
    <div ref="root" :component-name="name">
        <slot></slot>
    </div>
</template>
<script>
import AutoLayout from '@lume/autolayout';
var transformAttr = 'transform' in document.documentElement.style ? 'transform' : undefined;
transformAttr =
	transformAttr || ('-webkit-transform' in document.documentElement.style ? '-webkit-transform' : 'undefined');
    transformAttr = transformAttr || ('-moz-transform' in document.documentElement.style ? '-moz-transform' : 'undefined');
    transformAttr = transformAttr || ('-ms-transform' in document.documentElement.style ? '-ms-transform' : 'undefined');
    transformAttr = transformAttr || ('-o-transform' in document.documentElement.style ? '-o-transform' : 'undefined');
function setAbsoluteSizeAndPosition(elm, left, top, width, height) {
	elm.setAttribute( 'style', 
        `position: absolute;
        left: 0;
        top: 0;
        width: ${width}px;
        height: ${height}px;
        ${transformAttr}: translate3d(${left}px, ${top}px, 0px);`
	);
}

function keyGen(key) {
    return `[component-name="${key}"]`
}

function autoLayout(parentElm, visualFormat) {
	var view = new AutoLayout.View();
    const constraints = AutoLayout.VisualFormat.parse(visualFormat, {extended: true});
	console.log(constraints)
    view.addConstraints(constraints);
	var elements = {};
	console.log(view)
	for (var key in view.subViews) {
        
		var elm = parentElm.querySelector(keyGen(key)); //document.getElementById(key);
		if (elm) {
			elements[key] = elm;
            elm.classList.add('autolayout')
		}
	}
    console.log(view.subViews)
	var updateLayout = function () {
		view.setSize(
			parentElm ? parentElm.clientWidth : window.innerWidth,
			parentElm ? parentElm.clientHeight : window.innerHeight,
		);
        
		for (key in view.subViews) {
			var subView = view.subViews[key];
			if (elements[key]) {
				setAbsoluteSizeAndPosition(elements[key], subView.left, subView.top, subView.width, subView.height);
			}
		}
	};
	window.addEventListener('resize', updateLayout);
	updateLayout();
	return updateLayout;
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
                this.layout();
            })
        }
    },
    mounted() {
        this.layout();
    },
    methods: {
        layout() {
            const root = this.$refs.root;
            if(this.$slots.default && this.$slots.default.length > 0) {
                console.log(this.constraints)
                autoLayout(root, this.constraints);
            }
        }
    }
}


</script>

<style>
.autolayout{
    /* transition: all .3s; */
}
</style>