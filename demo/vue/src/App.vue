<template>
  <div :class="$style.body">
    <div :class="$style.sidebar">
        <div v-for="p in elementList" :key="p.concept">
            <div draggable="true" 
                :class="$style.part" 
                type="IfStatement"
                @dragstart="onDragStart()"
                @dragend="onDragEnd">
                {{p.concept}}
            </div>
            <div :class="[$style.literalRef]">
                <div :class="$style.part" >
                    {{ p.tag }}
                </div>
                <!-- <div :class="$style.literal" :style="sizeStyle" :name="node.icon"></div> -->
            </div>
        </div>
      </div>
      <div style="position: relative;">
        <j-frame
          :frameURL="frameURL"
          :dataElemDescription="">
          <template #container="{ source }">

          </template>
          <template #layout="{ source }">
            
          </template>
          <template #default="{ source }">

          </template>
        </j-frame>
      </div>

  </div>
</template>

<script>
import { ELem } from './data/elem';
function getList() {
    return [
        "DivElement",
        "UlElement",
        "LiElement",
        "TextElement",
    ].map(c => {
      const base = {
          concept: 'ViewElement',
          tag: c,
      }

      if(c === 'TextElement') {
        base.props: {
            content: "xxxx"
        }
      }

      return new ELem(base);
    })
}

export default {
  name: 'App',
  data() {
    return {
      elementList: getList(), 
      currentInstance: null,
      frameURL: `${window.location.origin}${window.location.pathname}vueproj.html`,
    }
  },
  methods: {
    onDragStart() {
      
    },
    onDragEnd() {

    }
  }
}
</script>

<style>
#app {
  font-family: PingFang SC, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.wrapper{
    width: 1200px;
    height: 600px;
    border: 1px solid #ccc;
}
.body{
    display: flex;
    flex-direction: horizontal;
}
.sidebar{
    width: 180px;
    border: 2px solid gold;
}
.sidebar > div {
    padding: 16px;
    display: flex;
    justify-content: center;
}
.part {
    width: 80px;
    height: 50px;
    background-color: gold;
    text-align: center;
    line-height: 50px;
}
.literalRef {
    position: absolute;
    z-index: -999;
    top: -999px;
    left: -999px;
}

.minimap{
    position: absolute;
    top: 20px;
    right: 20px;
    background: #ccc;
    opacity: 0.5;
}
.minimap > .content {

    width: 260px;
    height: 180px;
}

</style>
