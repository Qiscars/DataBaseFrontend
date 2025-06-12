<template>
    <div class="home">
        <div class="container">
          <div class="card">
            <div class="card-body">
               <slot> </slot>
            </div>
          </div>
        </div>
      </div>
</template>

<script lang="ts">

    export default {
      name: 'ContextBase',
      components: {
      }
    }

</script>

<style scoped>
    .container {
      margin-top: 20px;
    }

</style>
