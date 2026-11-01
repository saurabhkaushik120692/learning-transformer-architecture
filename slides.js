// Slide content. Add a slide = add one object to SLIDES.
// Types: title | map | table | pe | quiz | steps | summary | (default) concept slide with visual + points + code
/* ============ slide data ============ */
const SLIDES=[
 {type:'title',section:'Intro',title:'Attention Is All You Need'},

 {type:'map',section:'Intro',kicker:'the plan',title:'Seven stops through the paper'},

 // ---------- Foundations
 {section:'Foundations',kicker:'what is an LLM',title:'Language modelling = predict the next word',visual:DIA.llm,
  points:['<b>Large</b> means trained on a very large amount of data.','<b>Language model</b> means it predicts the next word from the words before it.','Every reply from GPT is this one step, repeated word by word.'],
  code:`import numpy as np

# raw scores (logits) the model gives each candidate word
words  = ["mat", "floor", "sofa", "moon"]
logits = np.array([3.2, 2.1, 1.5, -0.9])

probs = np.exp(logits) / np.exp(logits).sum()   # softmax
for w, p in zip(words, probs):
    print(f"{w:6s} {p:.2f}")

next_word = words[int(np.argmax(probs))]        # greedy pick -> "mat"`},

 {section:'Foundations',kicker:'how we got here',title:'From RNNs to the Transformer',visual:DIA.timeline,
  points:['RNN → LSTM/GRU added <b>gates</b> (input, forget, output) to remember longer.','Encoder–decoder models, then <b>attention</b> on top, improved translation.','ULMFiT showed <b>pretrain → fine-tune</b>, but everything up to here was LSTM-based.','The Transformer (June 2017) dropped recurrence and kept only attention.']},

 {type:'table',section:'Foundations',kicker:'side by side',title:'RNN / LSTM vs Transformer',
  head:['Feature','RNN / LSTM','Transformer'],
  rows:[['Processing style','Sequential, step by step','Parallel, all tokens at once'],['Speed','Slow','Fast (GPU-friendly)'],['Long-term dependency','Limited (vanishing gradient)','Very strong'],['Architecture','Gates: input, forget, output','Attention-based (self-attention)']],
  note:'LSTMs read data in order, so scaling to huge datasets was the big problem. Transformers removed that limit.'},

 {section:'Foundations',kicker:'why LSTMs hit a wall',title:'Sequential reading does not scale',visual:DIA.seqpar,
  points:['An LSTM must finish word 1 before word 2, so a GPU sits mostly idle.','A Transformer sends every token through in <b>one parallel step</b>.','Because order is no longer implied, the model needs <b>positional encoding</b> (coming up).'],
  code:`import torch, torch.nn as nn

x = torch.randn(1, 3, 512)          # batch, 3 tokens, 512-d

# LSTM: internally loops over the 3 time steps
lstm = nn.LSTM(512, 512, batch_first=True)
out_lstm, _ = lstm(x)

# Transformer encoder layer: all 3 tokens in one matrix op
enc = nn.TransformerEncoderLayer(d_model=512, nhead=8, batch_first=True)
out_tf = enc(x)
print(out_lstm.shape, out_tf.shape)  # both (1, 3, 512)`},

 {section:'Foundations',kicker:'two phases',title:'Training vs inference',visual:DIA.infer,
  points:['<b>Training</b>: show data, measure the error, adjust weights. Repeat for many epochs (forward pass + backprop).','<b>Inference</b>: weights are frozen. Prompt in, answer out.','NN, LSTM and Transformer all follow these same two phases.'],
  code:`import torch

model.train()                     # ---- training ----
for batch in loader:
    loss = loss_fn(model(batch.x), batch.y)   # forward pass
    loss.backward()                            # backprop
    optimizer.step(); optimizer.zero_grad()

model.eval()                      # ---- inference ----
with torch.no_grad():
    answer = model(prompt_tokens)`},

 {type:'quiz',section:'Foundations',kicker:'quick check',
  q:'Why could LSTM-based models not scale to internet-size datasets?',
  opts:['They had too few parameters','They process tokens one after another, so training cannot be parallelised','They cannot use embeddings','They only work for translation'],answer:1,
  explain:'<b>Sequential processing.</b> Each step waits for the previous one, so GPUs cannot process the sequence in parallel. Transformers fix this.'},

 // ---------- Input
 {section:'Input',kicker:'the steps',title:'What happens to your text',visual:DIA.pipeline,
  points:['<b>Tokenize</b> the text into pieces.','<b>Embed</b> each token as a 512-d vector.','Add <b>position</b> so order is not lost.','<b>Self-attention</b> adds context, then the <b>FFN</b> learns patterns.'],
  note:'Jay Alammar’s “Illustrated Transformer” blog walks the same path.'},

 {section:'Input',kicker:'step 1 & 2',title:'Tokenization and embedding',visual:DIA.embed,
  points:['“How are you” becomes 3 tokens, then 3 vectors of size <code>d_model = 512</code>.','The embedding layer works <b>like word2vec</b>, but it is <b>not pretrained</b>.','It is a trainable layer: the vectors are learned during training with the rest of the model.'],
  code:`import torch, torch.nn as nn

vocab = {"how": 0, "are": 1, "you": 2}
ids = torch.tensor([[vocab[w] for w in "how are you".split()]])

embed = nn.Embedding(num_embeddings=len(vocab), embedding_dim=512)
e = embed(ids)              # trainable lookup table
print(e.shape)              # (1, 3, 512) -> e1, e2, e3`},

 {section:'Input',kicker:'step 3 · positional encoding',title:'Why the model needs word order',visual:DIA.order,
  points:['Transformers read all tokens in parallel, so they <b>do not know order</b> by default.','Without position, “I love AI” and “AI love I” look the same.','Naive idea: number them 1, 2, 3 … n. Two problems:','No upper limit on token count, and large <b>discrete</b> numbers make training unstable.']},

 {section:'Input',kicker:'sinusoidal encoding',title:'Sine and cosine fix both problems',visual:DIA.sine,
  points:['Sin and cos always stay between <b>−1 and +1</b>, no matter how long the text.','<code>PE(pos, 2i) = sin(pos / 10000^(2i/d))</code>','<code>PE(pos, 2i+1) = cos(pos / 10000^(2i/d))</code>','<code>i</code> runs from 0 to d/2 − 1 and is the <b>dimension pair</b> index.'],
  code:`import numpy as np

def positional_encoding(seq_len, d_model):
    pe = np.zeros((seq_len, d_model))
    pos = np.arange(seq_len)[:, None]          # (seq_len, 1)
    i   = np.arange(d_model // 2)[None, :]     # dimension pairs
    angle = pos / (10000 ** (2 * i / d_model))
    pe[:, 0::2] = np.sin(angle)                # even dims
    pe[:, 1::2] = np.cos(angle)                # odd dims
    return pe

print(positional_encoding(4, 6).round(3))`},

 {type:'pe',section:'Input',kicker:'worked example · d_model = 6',title:'Positional vectors for “I love my country”',
  points:['d_model = 6, so i = 0, 1, 2 (three sin/cos pairs).','Position 0 is always <code>[0, 1, 0, 1, 0, 1]</code>.','Each vector has the <b>same size as the embedding</b>, so we can add them.']},

 {section:'Input',kicker:'vector operations',title:'Concatenate or add?',visual:DIA.vecops,
  points:['<b>Concatenation</b> appends vectors, so the length grows.','<b>Addition</b> sums values position by position, so the length stays the same.','Positional encoding is <b>added</b> to the embedding, which keeps every vector at 512-d.'],
  code:`import numpy as np
a, b = np.array([1, 2, 3]), np.array([5, 6, 7])

np.concatenate([a, b])   # [1 2 3 5 6 7]  length 6
a + b                    # [6 8 10]       length 3`},

 {type:'quiz',section:'Input',kicker:'quick check',
  q:'Why is the positional vector added to the embedding instead of concatenated?',
  opts:['Addition is faster to compute','Addition keeps the vector at d_model = 512, so every layer sees the same size','Concatenation loses the word meaning','The paper did not consider concatenation'],answer:1,
  explain:'<b>Same dimension.</b> Adding keeps every token vector at 512-d. Concatenating would double the size for every layer that follows.'},

 // ---------- Attention
 {section:'Attention',kicker:'step 4 · self-attention',title:'A word looks at the other words in its sentence',visual:DIA.apple,
  points:['<b>Attention</b>: weighting words across different sentences (e.g. source and translation).','<b>Self-attention</b>: a word looks at the other words in the <b>same</b> sentence to understand its meaning.','So the two “apple”s get <b>different embeddings</b>: the word now carries context.']},

 {section:'Attention',kicker:'money bank vs river bank',title:'Context is a weighted sum',visual:DIA.bank,
  points:['S1: <code>bank = w1·money + w2·bank + w3·grows</code>','S2: <code>bank = w1·river + w2·bank + w3·flows</code>','Calculating those weights is exactly what self-attention does.'],
  note:'Line thickness = weight. Example weights, the model learns the real ones.'},

 {section:'Attention',kicker:'K, Q, V',title:'Query, Key, Value',visual:DIA.qkv,
  points:['<b>Query</b>: what I am looking for. <b>Key</b>: what I contain or offer. <b>Value</b>: the actual information I provide.','Each embedding is multiplied by <code>W_Q</code>, <code>W_K</code>, <code>W_V</code>. They start random and are <b>learned</b> every epoch (forward pass + backprop).','Query vs key finds relevance: <code>score = Q·K</code> answers “how relevant is this word to me?”'],
  code:`import numpy as np
rng = np.random.default_rng(0)

d_model, d_k = 512, 64
e_money = rng.normal(size=d_model)

W_Q = rng.normal(size=(d_model, d_k))   # learnable
W_K = rng.normal(size=(d_model, d_k))   # learnable
W_V = rng.normal(size=(d_model, d_k))   # learnable

q, k, v = e_money @ W_Q, e_money @ W_K, e_money @ W_V
print(q.shape, k.shape, v.shape)        # (64,) each`},

 {section:'Attention',kicker:'where 64 comes from',title:'1 × 512 times 512 × 64 gives 1 × 64',visual:DIA.shapes,
  points:['The embedding is a <code>1 × 512</code> row. Each of W_Q, W_K, W_V is <code>512 × 64</code>.','So every q, k and v vector has <b>64 dimensions</b>, which is why <code>dₖ = 64</code>.','<code>√dₖ</code> is the square root of the key dimension, used to scale the attention scores for stability.'],
  code:`import numpy as np

e_money = np.random.randn(1, 512)      # 1 x 512
W_Q     = np.random.randn(512, 64)     # 512 x 64

q = e_money @ W_Q
print(q.shape)                          # (1, 64)  -> d_k = 64
print(np.sqrt(q.shape[-1]))             # 8.0`},

 {section:'Attention',kicker:'the formula',title:'Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V',visual:DIA.scaled,
  points:['<code>Q·Kᵀ</code> gives a 3×3 score grid: every word against every word.','Divide by <code>√dₖ</code>, then <b>softmax</b> turns each row into weights that sum to 1. High score → high attention, low score → low attention.','Multiply with V to get the final meaning: <code>output = weights · V</code>, the <b>contextual representation</b>.'],
  code:`import numpy as np

def softmax(x):
    x = x - x.max(axis=-1, keepdims=True)
    return np.exp(x) / np.exp(x).sum(axis=-1, keepdims=True)

def self_attention(X, W_Q, W_K, W_V):
    Q, K, V = X @ W_Q, X @ W_K, X @ W_V        # (3, d_k) each
    scores  = Q @ K.T / np.sqrt(K.shape[-1])   # (3, 3)
    weights = softmax(scores)                  # rows sum to 1
    return weights @ V, weights                # Y, attention map

X = np.random.randn(3, 512)                    # money, bank, grow
W = [np.random.randn(512, 64) * 0.05 for _ in range(3)]
Y, A = self_attention(X, *W)
print(A.round(2))`},

 {section:'Attention',kicker:'inside the formula',title:'Dot product, then softmax',visual:DIA.dot,
  points:['A dot product multiplies matching positions and adds: a <b>similarity score</b>.','Softmax makes every score positive and makes them add up to 1.','Those weights mix the value vectors into one contextual vector.'],
  code:`import numpy as np
np.dot([1, 2], [3, 4])          # 11

s = np.array([2.0, 1.0, 0.1])
w = np.exp(s) / np.exp(s).sum()
print(w.round(2))               # [0.66 0.24 0.1 ]`},

 {section:'Attention',kicker:'why √dₖ',title:'Scaling keeps training stable',visual:DIA.sqrtdk,
  points:['In the paper, the key dimension <code>dₖ = 64</code>, so <code>√dₖ = 8</code>.','Large dot products push softmax to extremes: one word gets ~100%, gradients vanish.','Dividing by 8 <b>prevents extremely large values</b>, keeps softmax smooth, gives better gradient flow and stable training. Hence “scaled” dot-product.'],
  code:`import numpy as np
softmax = lambda s: np.exp(s) / np.exp(s).sum()

raw = np.array([24., 16., 8.])
print(softmax(raw).round(3))      # [1.    0.    0.   ]
print(softmax(raw / 8).round(3))  # [0.665 0.245 0.09 ]`},

 {section:'Attention',kicker:'multi-head attention',title:'Eight heads look at the sentence differently',visual:DIA.multihead,
  points:['A <b>head</b> is one self-attention mechanism, defined by its own set of <code>W_Q</code>, <code>W_K</code>, <code>W_V</code>.','Single head = one viewpoint. Multi-head = <b>multiple viewpoints at the same time</b>.','The paper used <b>8 heads</b> (a hyperparameter), each with dₖ = 64. Concatenated: 8 × 64 = 512, then mixed by <code>W_O</code>.'],
  code:`import torch, torch.nn as nn

mha = nn.MultiheadAttention(embed_dim=512, num_heads=8, batch_first=True)
x = torch.randn(1, 3, 512)               # money, bank, grow
out, weights = mha(x, x, x)              # self-attention: Q = K = V = x
print(out.shape, weights.shape)          # (1, 3, 512) (1, 3, 3)`},

 {section:'Attention',kicker:'why multiple heads',title:'One sentence, more than one meaning',visual:DIA.ambig,
  points:['Single-head attention can capture <b>only one perspective</b>. Real sentences often carry several.','“The chicken is ready to eat”: is the chicken cooked, or hungry?','“Man saw the astronomer with a telescope”: who has the telescope?','Multiple heads capture different relationships and focus on different parts <b>in parallel</b>.']},

 {section:'Attention',kicker:'combining the heads',title:'Concatenate, then multiply by W_O',visual:DIA.concat,
  points:['Example: 2 words (money, bank), 2 heads, each head gives a <code>2 × 3</code> contextual matrix.','Concatenate horizontally: <code>2 × 6</code>.','Multiply by the learnable <code>W_O</code> (<code>6 × 3</code>) to get the final <code>2 × 3</code> contextual embeddings.','In the paper: 8 heads × 64 = 512, and W_O is 512 × 512.'],
  code:`import numpy as np

ce_head1 = np.random.randn(2, 3)        # money, bank from head 1
ce_head2 = np.random.randn(2, 3)        # money, bank from head 2

concat = np.concatenate([ce_head1, ce_head2], axis=1)   # (2, 6)
W_O    = np.random.randn(6, 3)                           # learnable
final  = concat @ W_O                                    # (2, 3)
print(concat.shape, final.shape)`},

 {type:'quiz',section:'Attention',kicker:'quick check',
  q:'In the original paper, what is √dₖ and why is it used?',
  opts:['√512 ≈ 22.6, to make the model bigger','√64 = 8, to stop large dot products from saturating softmax','√8 ≈ 2.8, because there are 8 heads','It is a learned parameter'],answer:1,
  explain:'<b>dₖ = 64, so √dₖ = 8.</b> Dividing scores by 8 keeps softmax from collapsing onto one word, which keeps gradients healthy.'},

 // ---------- Block
 {section:'Encoder block',kicker:'from ResNet (CNN)',title:'Residual connections',visual:DIA.residual,
  points:['Deep networks suffer from <b>vanishing gradients</b>: weights stop updating, information gets lost.','A skip connection adds the input back: <code>output = x + F(x)</code>.','The layer learns a <b>small improvement</b> over its input instead of a whole new transformation.','Result: better gradient flow, faster training, deep stacks of 6, 12, 24 layers.']},

 {section:'Encoder block',kicker:'add & norm',title:'Add, then layer-normalize',visual:DIA.addnorm,
  points:['Add the residual: <code>z′ = z + x</code>.','<b>LayerNorm</b> rescales each token vector to mean 0 and spread 1.','This happens after attention and again after the FFN.'],
  code:`import torch, torch.nn as nn

x = torch.tensor([[1., 1., 2.]])     # input to the sub-layer
z = torch.tensor([[1., 3., 4.]])     # sub-layer (attention) output

norm = nn.LayerNorm(3, elementwise_affine=False)
print(norm(x + z))                   # tensor([[-1.2247, 0.0000, 1.2247]])`},

 {section:'Encoder block',kicker:'layer normalization',title:'LayerNorm(x) = (x − μ) / √(σ² + ε) · γ + β',visual:DIA.scaling,
  points:['μ = mean of the vector, σ² = variance, ε = a small value that avoids division by zero.','<b>γ</b> (scale) and <b>β</b> (shift) are learnable. They start at <code>[1,1,1]</code> and <code>[0,0,0]</code> and change during backprop.','β gives the model freedom to choose <b>where the data is centred</b>.','Benefits: stable training (no exploding activations), better gradient flow, faster convergence.'],
  code:`import numpy as np

def layer_norm(x, gamma, beta, eps=1e-5):
    mu  = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return (x - mu) / np.sqrt(var + eps) * gamma + beta

x = np.array([2., 4., 6.])
print(layer_norm(x, gamma=np.ones(3), beta=np.zeros(3)).round(2))
# [-1.22  0.    1.22]

# compare: min-max scaling squeezes into [0, 1]
print((x - x.min()) / (x.max() - x.min()))   # [0.  0.5 1. ]`},

 {section:'Encoder block',kicker:'step 6 · FFN',title:'Why a feed-forward network?',visual:DIA.ffn,
  points:['Self-attention mixes information <b>across</b> tokens. The FFN then works on each token <b>independently</b>.','<code>FFN(x) = ReLU(x·W1 + b1)·W2 + b2</code>','Paper sizes: <b>512 → 2048 → 512</b>.','ReLU adds <b>non-linearity</b>, so the model can learn curved, complex patterns instead of straight lines.'],
  code:`import torch.nn as nn

ffn = nn.Sequential(
    nn.Linear(512, 2048),   # expand
    nn.ReLU(),              # non-linearity
    nn.Linear(2048, 512),   # back to d_model
)`},

 {section:'Encoder block',kicker:'putting it together',title:'One encoder block, end to end',visual:DIA.encoder,
  points:['x = e + p goes into multi-head self-attention, giving z (contextual vectors).','Add x back, LayerNorm, then the FFN, then Add & Norm again.','With one encoder, the output goes to the <b>decoder</b>. With many, it feeds the <b>next encoder block</b>.'],
  code:`import torch.nn as nn

class EncoderBlock(nn.Module):
    def __init__(self, d=512, heads=8, d_ff=2048):
        super().__init__()
        self.attn  = nn.MultiheadAttention(d, heads, batch_first=True)
        self.norm1 = nn.LayerNorm(d)
        self.ffn   = nn.Sequential(nn.Linear(d, d_ff), nn.ReLU(), nn.Linear(d_ff, d))
        self.norm2 = nn.LayerNorm(d)

    def forward(self, x):
        z, _ = self.attn(x, x, x)
        x = self.norm1(x + z)            # add & norm
        return self.norm2(x + self.ffn(x))`},

 // ---------- Decoder
 {section:'Decoder',kicker:'the original job',title:'Built for machine translation',visual:DIA.nmt,
  points:['The paper introduced the Transformer for <b>neural machine translation</b>: English → French and English → German.','<b>Encoder</b> reads the whole source sentence.','<b>Decoder</b> generates the translated sentence <b>word by word</b>, looking back at the encoder.']},

 {section:'Decoder',kicker:'training vs prediction',title:'Parallel training, sequential inference',visual:DIA.autoreg,
  points:['RNN/LSTM: training and prediction are <b>both sequential</b>, so training is slow.','Transformer decoder: <b>non-autoregressive in training</b>. All target words go in at once, with a mask.','At prediction it is <b>autoregressive</b>: each new word is fed back in to produce the next.','Fast parallel training is what made huge datasets, and so LLMs, possible.'],
  code:`# inference: one token per pass, fed back in (greedy decoding)
tokens = ["<SOS>"]
while tokens[-1] != "<EOS>" and len(tokens) < 50:
    probs = decoder(encoder_out, tokens)   # probs for the next word
    next_tok = vocab[probs[-1].argmax()]
    tokens.append(next_tok)

print(tokens)   # ['<SOS>', 'हम', 'दोस्त', 'हैं', '<EOS>']`},

 {section:'Decoder',kicker:'decoder input',title:'Shifted right: add a start token',visual:DIA.shifted,
  points:['“Shifted right” means adding a token that marks the <b>start of the sentence</b>: <code>&lt;SOS&gt;</code>.','Input <code>&lt;SOS&gt; हम दोस्त हैं</code> is tokenized, embedded (512-d) and given positional encoding, like the encoder.','Each position learns to predict the word that comes <b>after</b> it.']},

 {section:'Decoder',kicker:'masked self-attention',title:'Future words are blocked',visual:DIA.maskflow,
  points:['Each token may attend <b>only to itself and earlier tokens</b>.','Add a mask matrix to the scaled scores: <code>0</code> where allowed, <code>−∞</code> for future words.','Softmax turns every <code>−∞</code> into <b>0</b>, so future words get no weight.'],
  code:`import torch

n = 3                                    # हम दोस्त हैं
scores = torch.randn(n, n) / 8           # scaled scores
mask = torch.triu(torch.full((n, n), float("-inf")), diagonal=1)
weights = (scores + mask).softmax(dim=-1)
print(weights.round(decimals=2))         # upper triangle = 0`},

 {section:'Decoder',kicker:'self vs cross',title:'Same sequence, or a different one',visual:DIA.selfcross,
  points:['<b>Self-attention</b>: importance of each word relative to other words in the <b>same</b> sequence.','<b>Cross-attention</b>: one sequence attends to a <b>different</b> sequence to gather relevant information.','Dot size = attention weight. Example values, not real model output.']},

 {section:'Decoder',kicker:'cross-attention',title:'Queries from the output, keys and values from the input',visual:DIA.crosscalc,
  points:['<b>Q</b> comes from the decoder (हम दोस्त हैं). <b>K</b> and <b>V</b> come from the encoder output (we are friends).','Same formula: <code>softmax(QKᵀ / √dₖ) · V</code>.','Each Hindi word gets a contextual vector built from the English words it matches, e.g. दोस्त ↔ friends.'],
  code:`import torch, torch.nn as nn

cross = nn.MultiheadAttention(512, 8, batch_first=True)

dec = torch.randn(1, 3, 512)    # हम दोस्त हैं  (after masked attn + norm)
enc = torch.randn(1, 3, 512)    # we are friends (encoder output)

out, w = cross(query=dec, key=enc, value=enc)
print(w.shape)                  # (1, 3, 3): Hindi rows x English cols`},

 {section:'Decoder',kicker:'putting it together',title:'One decoder block, end to end',visual:DIA.decoder,
  points:['Masked self-attention → Add & Norm.','Cross-attention with the encoder → Add & Norm.','FFN (512 → 2048 → 512) → Add & Norm. Every step keeps a residual (skip) connection.','The final decoder output goes to the Linear layer and Softmax.'],
  code:`import torch.nn as nn

dec_layer = nn.TransformerDecoderLayer(d_model=512, nhead=8,
                                       dim_feedforward=2048, batch_first=True)
decoder = nn.TransformerDecoder(dec_layer, num_layers=6)

# tgt: shifted-right target, memory: encoder output
out = decoder(tgt, memory, tgt_mask=causal_mask)`},

 {section:'Decoder',kicker:'linear + softmax',title:'From a vector to a word',visual:DIA.linear,
  points:['The <b>Linear (projection) layer</b> maps 512-d to the <b>size of the output vocabulary</b>.','Softmax then gives a probability for every word in that vocabulary.','Training compares the prediction (हम = 0.7) with the actual word (हम) and updates the weights.'],
  code:`import torch, torch.nn as nn

vocab = ["<SOS>", "हम", "दोस्त", "हैं"]
proj  = nn.Linear(512, len(vocab))      # 512 -> vocab size

h = torch.randn(1, 512)                 # decoder output for one position
probs = proj(h).softmax(dim=-1)
print(vocab[probs.argmax()])`},

 {type:'quiz',section:'Decoder',kicker:'quick check',
  q:'How does the Transformer decoder behave in training vs at prediction time?',
  opts:['Autoregressive in both','Parallel (non-autoregressive) in training, autoregressive at prediction','Autoregressive in training, parallel at prediction','It does not change'],answer:1,
  explain:'<b>Parallel in training</b>: the whole shifted target goes in at once and the mask hides future words. <b>Autoregressive at prediction</b>: each generated word is fed back in.'},

 // ---------- Architecture
 {section:'Architecture',kicker:'the whole paper in one picture',title:'Encoder and decoder',visual:DIA.full,
  points:['Left: the encoder block repeated N times.','Right: the decoder adds <b>masked</b> attention and <b>cross-attention</b>.','Cross-attention: Q comes from the decoder, K and V come from the encoder.','Top: Linear + Softmax gives the probability of each next word.']},

 {type:'steps',section:'Architecture',kicker:'from my notes',title:'Encoder side vs decoder side',
  enc:['Input sequence','Input embedding','Positional encoding','Self-attention (multi-head)','Add & layer normalization','Feed-forward network','Residual + layer normalization','Repeat the block N times'],
  dec:['Output sequence (shifted right)','Output embedding (512-d)','Positional encoding','Masked multi-head attention','Add & layer normalization','Residual connection','Cross-attention (encoder ↔ decoder)','Add & layer normalization','Feed-forward network','Add & layer normalization','Linear layer','Softmax','Final output (probabilities)','Repeat the block N times'],
  keyEnc:[3],keyDec:[3,6,11]},

 {section:'Architecture',kicker:'why 6 blocks',title:'Stacking layers builds meaning',visual:DIA.layers,
  points:['The paper used <b>6 encoder + 6 decoder</b> layers. 6 is a hyperparameter found by experiment, not a rule.','Stacking captures deeper relationships, longer context and hierarchical meaning.','Modern models: <b>BERT base 12</b>, <b>BERT large 24</b>, <b>GPT 12 to 96+</b> layers.']},

 {section:'Architecture',kicker:'where today’s LLMs fit',title:'Most LLMs use only the decoder',visual:DIA.families,
  points:['BERT keeps only the <b>encoder</b>: good at understanding text.','GPT, Claude Sonnet, Qwen, DeepSeek, Llama and Gemini are <b>decoder-only</b>.','Decoder-only plus next-word prediction is the recipe behind chat models.'],
  code:`from transformers import AutoTokenizer, AutoModelForCausalLM

tok = AutoTokenizer.from_pretrained("gpt2")          # decoder-only
model = AutoModelForCausalLM.from_pretrained("gpt2")

ids = tok("Attention is all you", return_tensors="pt")
out = model.generate(**ids, max_new_tokens=3)
print(tok.decode(out[0]))`},

 {type:'quiz',section:'Architecture',kicker:'quick check',
  q:'In the decoder’s cross-attention, where do Q, K and V come from?',
  opts:['All three from the encoder','Q from the decoder, K and V from the encoder','Q from the encoder, K and V from the decoder','All three from the decoder'],answer:1,
  explain:'<b>Q from the decoder, K and V from the encoder.</b> The decoder asks a question; the encoder’s output supplies what to match and what to copy.'},

 {type:'summary',section:'Wrap-up',kicker:'what to remember',title:'The Transformer in ten lines',
  points:['LLMs predict the next word; Transformers made that scale.','Parallel training replaced the LSTM’s step-by-step loop; inference is still word by word.','Embeddings are trainable, 512-d, and get positions <b>added</b> via sin/cos.','Self-attention = weighted sum of other words → contextual vectors.','<code>softmax(QKᵀ/√dₖ)V</code>: 1×512 · 512×64 gives dₖ = 64, so √dₖ = 8.','8 heads = 8 viewpoints; concat, then × W_O.','Residual + LayerNorm (γ, β learnable) keep deep stacks trainable; FFN 512→2048→512 adds non-linearity.','Decoder: shifted right, masked self-attention, then cross-attention (Q from output, K/V from input).','Linear → vocab size, softmax → next-word probabilities.','Encoder ×6 + decoder ×6 in the paper; modern LLMs are decoder-only.'],
  refs:[['Vaswani et al. (2017), Attention Is All You Need','https://arxiv.org/abs/1706.03762'],['Jay Alammar, The Illustrated Transformer','https://jalammar.github.io/illustrated-transformer/']]}
];

