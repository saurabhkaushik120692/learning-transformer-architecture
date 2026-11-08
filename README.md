# Learning Transformer Architecture

An interactive slide deck that explains the Transformer from **"Attention Is All You Need"** piece by piece: hand-drawn style diagrams, Python code for each concept, and quizzes.

**Live deck:** `https://<your-github-username>.github.io/learning-transformer-architecture/`

## Episodes

Built as a 4-part video series, 20–30 minutes each. Jump straight to an episode with `#ep1` … `#ep4`.

| Episode | Topics |
|---|---|
| 01 · Why Transformers, and how text goes in | What a language model does, RNN → LSTM → Transformer, why LSTMs could not scale, tokens and embeddings, positional encoding |
| 02 · Self-attention from scratch | Context as a weighted sum, self-attention by hand, making it trainable with Q / K / V, the attention formula, why divide by √d_k |
| 03 · Multi-head attention and the encoder | Heads as viewpoints, ambiguous sentences, concat and W_O, residual connections, LayerNorm, feed-forward network, full encoder block |
| 04 · The decoder and the full architecture | Translation, autoregressive inference, shifted right, masked attention, cross-attention, KV cache, Linear + softmax, encoder-only vs decoder-only LLMs |

Each episode opens with a cover slide (topics + recap of the previous episode) and ends with a recap and an "up next" card.

Content slides are labelled **Step 2.3** style (episode 2, step 3), so viewers can find a point again from the video.

### Diagram colour code

| Style | Meaning |
|---|---|
| Pink-red, solid | Learnable weights: W_Q, W_K, W_V, Wᴼ, embedding, FFN, LayerNorm γ and β, final Linear |
| Blue | Data and vectors: embeddings, q, k, v, scores, contextual outputs |
| Grey, dashed | Fixed operations with no weights: softmax, ÷ √d_k, mask, sin/cos positional encoding, skip connections |
| Yellow | The focus of the current slide |

In `diagrams.js` these are the classes `learn`, `data`, `fix` and `hot` on boxes, cells and arrows.

## Presenting and recording

| Key | Action |
|---|---|
| `→` / `Space` | Reveal the next point; on the last point, go to the next slide |
| `←` | Hide the last point; at the first, go back a slide |
| `A` | Reveal all points on this slide |
| `S` | Step-by-step reveal on / off |
| `R` | Recording mode: fixed 16:9 canvas, toolbar hides until you move the mouse to the bottom |
| `P` | Pointer (large red dot) on / off |
| `H` | Highlighter on / off |
| `X` | Clear highlights on the current slide |
| `C` | Show the Python code for the slide |
| `G` | Overview of all slides, grouped by episode |
| `T` | Light / dark theme |
| `F` | Fullscreen |
| `Esc` | Close overview or turn off pointer / highlighter |

On quiz slides, `→` first reveals the answer, then moves on. Link to a single slide by its number: `index.html#17`.

**Recording tip:** press `F` for fullscreen, then `R`. At 1920 × 1080 the 16:9 canvas fills the screen exactly.

## Project structure

```
index.html     page shell and toolbar
style.css      ruled-paper look, light and dark themes
diagrams.js    SVG drawing helpers and one diagram per concept
slides.js      all slide content (the SLIDES array)
deck.js        engine: rendering, episodes, step reveal, pointer, highlighter, recording mode
```

## Add a slide

Add one object to `SLIDES` in `slides.js`:

```js
{ section: 'Attention', kicker: 'my new idea', title: 'Slide title',
  visual: DIA.qkv,                       // any diagram from diagrams.js
  points: ['First point', 'Second point'],
  code: `print("python shown when you press C")` }
```

Other types: `quiz` (`q`, `opts`, `answer`, `explain`), `table`, `steps`, `summary`, `episode` (cover, `ep: n`), `next` (end card, `ep: n`). Episode titles, topics and recaps live in `EPISODES` at the top of `slides.js`.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Publish on GitHub Pages

Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.

## References

- Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (2017)
- Jay Alammar, [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
