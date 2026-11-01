# Learning Transformer Architecture

My notes on **"Attention Is All You Need"** (Vaswani et al., 2017), turned into an interactive slide deck: hand-drawn style diagrams, Python code for each concept, and quizzes.

**Live deck:** `https://<your-github-username>.github.io/learning-transformer-architecture/`

## What's inside

| Section | Topics |
|---|---|
| Foundations | What an LLM is, RNN → LSTM → Transformer, why LSTMs could not scale, training vs inference |
| Input | Tokenization, embeddings (512-d, trainable), concat vs add, positional encoding with sin/cos and a worked example |
| Attention | Self-attention by hand, making it trainable, Q / K / V, shapes (d_k = 64), scaled dot-product, √d_k, multi-head attention and W_O |
| Encoder block | Residual connections, Add & LayerNorm (γ, β), feed-forward network 512 → 2048 → 512 |
| Decoder | Machine translation, autoregressive inference, shifted right, masked self-attention, cross-attention, KV cache, Linear + softmax |
| Architecture | Full encoder–decoder picture, why 6 layers, encoder-only vs decoder-only models |

50 slides in total. The handwritten source pages are in [`notes/`](notes/).

## Controls

| Key | Action |
|---|---|
| `←` `→` / swipe | Previous / next slide |
| `G` | Overview of all slides |
| `C` | Show the Python code for the slide |
| `H` | Highlighter on / off |
| `X` | Clear highlights on the current slide |
| `T` | Light / dark theme |
| `F` | Fullscreen |
| `Esc` | Close overview or turn off the highlighter |

Link to a single slide by adding its number: `index.html#17`.

## Project structure

```
index.html     page shell and toolbar
style.css      notebook look, light and dark themes
diagrams.js    SVG drawing helpers and one diagram per concept
slides.js      all slide content (the SLIDES array)
deck.js        engine: rendering, navigation, code view, highlighter
notes/         photos of the original notebook pages
```

## Add a slide

Add one object to `SLIDES` in `slides.js`:

```js
{ section: 'Attention', kicker: 'my new idea', title: 'Slide title',
  visual: DIA.qkv,                       // any diagram from diagrams.js
  points: ['First point', 'Second point'],
  code: `print("python shown when you press C")` }
```

Other types: `quiz` (`q`, `opts`, `answer`, `explain`), `table`, `steps`, `summary`.

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
