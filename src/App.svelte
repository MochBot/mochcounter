<script lang="ts">
  import NumberFlow from "@number-flow/svelte";
  import { Confetti } from "svelte-confetti";
  import "./app.css";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  let friends = $state(0);
  let level = $state(0);
  let yay = $state(false);
  let clock = $state(Date.now());
  let key = $state(0);

  const hhmmss = (date: Date): number[] => {
    return [date.getHours(), date.getMinutes(), date.getSeconds()];
  };

  const digits = 4;

  onMount(() => {
    let timer: number;
    const handler = async () => {
      const res: {
        friends: number;
        level: number;
      } | null = await (await fetch("/counter").catch(() => null))
        ?.json?.()
        .catch(() => null);

      if (res) {
        let changed = false;
        if (res.level >= 10000 && level < 10000) yay = true;
        if (res.friends !== friends) changed = true;
        friends = res.friends;
        let newLevel = Math.round(res.level * 10 ** digits) / 10 ** digits;
        changed ||= Math.round(newLevel) !== Math.round(level);
        level = newLevel;
        if (changed) key++;
      }

      timer = setTimeout(handler, 5000);
    };

    handler();

    let frame: number;
    const ticker = () => {
      clock = Date.now();
      frame = requestAnimationFrame(ticker);
    };
    frame = requestAnimationFrame(ticker);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  });
</script>

{#if level != 0}
  <main
    class="w-full h-screen flex justify-center items-center bg-black flex-col"
    in:fly={{
      y: -20,
      duration: 400,
      opacity: 0,
    }}
  >
    {#key key}
      <img
        class="will-change-transform"
        alt="logo"
        style="clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%); width: 300px; height: 300px; margin-bottom: 2rem; animation: hithere 1s ease; animation-delay: 0.2s;"
        src="https://tetr.io/user-content/avatars/65c4d8d9ce9cb4d6c9d73c13.jpg?rv=1707399902733"
      />
    {/key}
    <NumberFlow value={friends} prefix="Friends: " />
    <NumberFlow
      value={level}
      prefix="Level: "
      format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }}
    />
  </main>
  <div
    class="fixed bottom-10 w-screen flex justify-center"
    id="clock"
    in:fly={{ y: 20, duration: 400, opacity: 0, delay: 200 }}
  >
    <NumberFlow
      value={hhmmss(new Date(clock))[0]}
      format={{ minimumIntegerDigits: 2 }}
      suffix=":"
    />
    <NumberFlow
      value={hhmmss(new Date(clock))[1]}
      format={{ minimumIntegerDigits: 2 }}
      suffix=":"
    />
    <NumberFlow value={hhmmss(new Date(clock))[2]} format={{ minimumIntegerDigits: 2 }} />
  </div>

  {#if yay}
    <div
      style="
 position: fixed;
 top: -50px;
 left: 0;
 height: 100vh;
 width: 100vw;
 display: flex;
 justify-content: center;
 overflow: hidden;
 pointer-events: none;"
    >
      <Confetti
        x={[-5, 5]}
        y={[0, 0.1]}
        delay={[500, 2000]}
        infinite
        duration={5000}
        amount={500}
        fallDistance="100vh"
      />
    </div>
  {/if}
{:else}
  <div class="flex items-center justify-center w-full h-screen bg-black">
    <svg class="animate-spin h-12 w-12" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="white"
        stroke-width="4"
        stroke-linecap="round"
        stroke-dasharray="47.12 15.71"
      />
    </svg>
  </div>
{/if}

<style>
  :global(number-flow-svelte) {
    --number-flow-char-height: 0.85em;
    font-size: 4rem;
    font-weight: 500;
    color: white;
  }

  #clock :global(number-flow-svelte) {
    font-size: 2rem;
  }
</style>
