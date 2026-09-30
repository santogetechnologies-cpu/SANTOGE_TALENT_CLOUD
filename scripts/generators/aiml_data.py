# scripts/generators/aiml_data.py
"""
90 Days of Course-Specific Placement Accelerator Content for AI / ML & GenAI (track: aiml)
Phases:
1. Days 1-15: AI/ML Foundations, Math, Python, Preprocessing & Evaluation
2. Days 16-30: Supervised & Unsupervised Learning, Ensembles & Dimensionality Reduction
3. Days 31-45: Deep Learning, Neural Networks, PyTorch & Convolutional Models
4. Days 46-60: Sequence Models, Transformers, Self-Attention & LLM Foundations
5. Days 61-75: RAG Architectures, Vector Databases, Chunking & Autonomous Agents
6. Days 76-89: Fine-Tuning (LoRA), LLM Evaluation (RAGAS), Quantization & Production AI
Day 90: Final Placement Challenge
"""

COMM_TYPES = [
    "interview-question", "technical-explanation", "client-conversation",
    "team-communication", "workplace-scenario", "problem-explanation",
    "project-explanation", "technical-presentation", "email-response",
    "manager-conversation", "hr-question", "conflict-resolution",
    "requirement-clarification", "technical-to-nontechnical",
]

APT_TOPICS = [
    "Percentages & Growth", "Ratios & Proportions", "Averages & Distributions",
    "Profit, Margin & ROI", "Time, Work & Capacity", "Speed, Latency & Distance",
    "Probability & Reliability", "Combinatorics & Permutations", "Number Systems & Units",
    "Data Interpretation & Metrics", "Statistics & Dispersion", "Financial & Business Math",
]

LOGIC_TYPES = [
    "Sequence Reasoning", "Workflow Ordering", "Deductive Analysis",
    "Constraint Solving", "Debugging Logic", "Process Flow",
    "Cause & Effect", "Decision Architecture",
]

def get_aiml_days():
    days = []

    # 15 Detailed Foundations Days
    foundations = [
        (1, "technical-to-nontechnical", "Explaining AI vs Traditional Software to an Executive",
         "A non-technical VP asks why they should fund an AI initiative instead of adding traditional deterministic rule-based software.",
         "Explain the paradigm shift from rule-based programming (Rules + Data = Answers) to machine learning (Data + Answers = Rules) with business ROI.",
         ["Machine Learning", "Pattern Recognition", "Heuristics vs Learned Models"], "The Paradigm Inversion Principle (Contrast explicit logic with data-driven adaptation)",
         "Traditional software uses if-else statements written by humans. AI uses algorithms that learn from data so you don't have to code every single rule manually.",
         "Too simplistic. Fails to explain where AI shines (unstructured data, edge cases) and ignores implementation trade-offs like model explainability.",
         "Traditional software functions like an explicit spreadsheet: engineers write deterministic if-else rules. If a customer scenario wasn't pre-programmed, the software fails. Machine learning inverts this paradigm: we feed the model historical transaction data and verified outcomes, and the algorithm discovers statistical patterns too complex for human coders. For our fraud detection system, this means automatically identifying emerging attack vectors in milliseconds without waiting for quarterly code releases.",
         "Compelling executive framing: contrasts static code limitations with dynamic pattern discovery and cites operational fraud defense value.",
         "Always articulate the core boundary: use traditional code for deterministic math/compliance, and use ML when patterns are high-dimensional or constantly shifting.",
         "Percentages & Growth", "Classification Model Accuracy Metric Calculation",
         "A fraud detection classification model evaluates 2,400 transaction records and predicts 2,208 transactions correctly. What is the model's overall accuracy percentage?",
         ["92.0%", "90.5%", "94.0%", "88.5%"], 0,
         "Calculation: Accuracy = (Correct Predictions / Total Samples) * 100 = (2,208 / 2,400) * 100 = 92.0%.", "Accuracy = Correct / Total",
         "Sequence Reasoning", "Machine Learning Pipeline Stage Ordering",
         "Which sequence accurately represents the standard machine learning development and deployment lifecycle?",
         ["Problem Definition -> Exploratory Data Analysis -> Data Cleaning & Split -> Feature Engineering -> Model Training -> Evaluation -> Deployment -> Drift Monitoring",
          "Model Training -> Data Cleaning -> Hyperparameter Tuning -> Feature Engineering -> Inference",
          "Exploratory Data Analysis -> Model Training -> Data Split -> Deployment -> Feature Selection",
          "Data Cleaning -> Deployment -> Model Training -> Evaluation -> Feature Engineering"], 0,
         "A disciplined ML lifecycle begins with problem definition and EDA, followed by data cleaning and train/test splitting before feature engineering to prevent data leakage, followed by training, validation, deployment, and ongoing drift monitoring."),

        (2, "interview-question", "Explaining the Bias-Variance Tradeoff in an Interview",
         "An ML interviewer asks: 'Your model achieves 99.8% training accuracy but only 71.2% test accuracy. What is happening and how do you fix it?'",
         "Diagnose high variance (overfitting), explain the bias-variance tradeoff mathematically and intuitively, and detail concrete remediation techniques.",
         ["Overfitting (High Variance)", "Generalization Error", "L1/L2 Regularization"], "Root Cause & Remediation Framework (Diagnose, Explain Tradeoff, Prescribe Solutions)",
         "The model is overfitting because training accuracy is much higher than test accuracy. We should just add more data or reduce the number of epochs.",
         "Identifies overfitting but gives surface-level answers. Missing regularization techniques, cross-validation, and complexity reduction methods.",
         "This massive delta indicates high variance and overfitting: the model has memorized training noise rather than learning generalizable underlying patterns. To rebalance the tradeoff, I would take four actions: first, introduce L1/L2 regularization or dropout to penalize excessive parameter weights; second, apply k-fold cross-validation to assess variance stability; third, prune model complexity or limit tree depth; and fourth, augment our training dataset to expose the model to diverse distributions.",
         "Demonstrates comprehensive mastery of generalization theory and provides an actionable engineering checklist.",
         "Structure ML interview responses into immediate diagnostic confirmation followed by layered remedies across data, architecture, and regularization.",
         "Ratios & Proportions", "Train, Validation, and Test Dataset Split Ratio",
         "A dataset contains 120,000 labeled samples. The lead data scientist prescribes an 8:1:1 split for training, validation, and testing respectively. How many samples are allocated to the training split?",
         ["96,000 samples", "90,000 samples", "100,000 samples", "84,000 samples"], 0,
         "Calculation: Total parts = 8 + 1 + 1 = 10 parts. Training share = (8/10) * 120,000 = 96,000 samples.", "Split = Total * (Share / Total Parts)",
         "Workflow Ordering", "Preventing Data Leakage During Feature Scaling",
         "When standardizing features using StandardScaler (mean=0, std=1), what is the mandatory sequence to prevent test set data leakage?",
         ["Split dataset into Train and Test -> Fit scaler on Train set only -> Transform Train set -> Transform Test set using fitted Train scaler",
          "Fit and transform the entire dataset with StandardScaler -> Split into Train and Test sets",
          "Fit scaler on Test set -> Transform Train set using Test scaler parameters -> Train model",
          "Fit and transform Train set -> Fit and transform Test set independently with new scaler parameters"], 0,
         "To prevent data leakage, the scaler must learn distribution parameters (mean and variance) strictly from the training split. Applying test set parameters or fitting on the entire dataset leaks future distributional knowledge into model training."),

        (3, "team-communication", "Precision vs Recall Tradeoffs in Medical Diagnostic AI",
         "Your AI team is debating the decision threshold for a cancer screening classifier where false negatives are fatal.",
         "Communicate why Recall must be prioritized over Precision in life-critical medical diagnostics and how to adjust the classification threshold.",
         ["Recall (Sensitivity)", "Precision (Positive Predictive Value)", "F2-Score"], "Impact-Driven Metric Selection (Align statistical metrics with real-world cost of error)",
         "Precision is how many predicted positives were right, and Recall is how many actual positives we found. We should just aim for a high F1-score.",
         "F1 gives equal weight to precision and recall. In medical diagnostics, a false negative is catastrophic compared to an inconvenient false positive.",
         "In clinical diagnostics, the cost of a False Negative is fatal—a patient with cancer is told they are healthy and denied treatment. Conversely, a False Positive triggers a confirmatory biopsy. Therefore, we must maximize Recall (Sensitivity), tolerating lower Precision. I propose lowering our classification threshold from 0.50 to 0.25 to capture all borderline cases, and optimizing for the F2-score which weights recall twice as heavily as precision in our validation loss.",
         "Exemplary engineering leadership: maps ethical and clinical realities directly to loss functions and decision thresholds.",
         "Whenever discussing classification metrics, always state the real-world consequence of a False Positive versus a False Negative.",
         "Averages & Distributions", "Cross-Validation Accuracy Mean and Variance",
         "A 5-fold cross-validation experiment on an XGBoost model yielded accuracy scores of: 88%, 91%, 89%, 94%, and 93%. What is the mean cross-validation accuracy?",
         ["91.0%", "90.5%", "92.0%", "89.5%"], 0,
         "Calculation: Sum = 88 + 91 + 89 + 94 + 93 = 455%. Mean = 455 / 5 = 91.0%.", "Mean = Sum / Count",
         "Deductive Analysis", "ROC-AUC Curve Performance Deduction",
         "An AI diagnostic classifier yields an Area Under the ROC Curve (ROC-AUC) of exactly 0.50. What does this score indicate about model performance?",
         ["The classifier performs no better than random guessing across all discrimination thresholds",
          "The classifier has achieved perfect separation between positive and negative classes",
          "The classifier is overfitting to the minority class distribution",
          "The classifier has 50% accuracy on the training set and 100% accuracy on the test set"], 0,
         "An ROC-AUC score of 0.50 represents the diagonal line of discrimination, meaning the model's true positive rate equals its false positive rate at every threshold—equivalent to random chance."),

        (4, "client-conversation", "Explaining Model Hallucinations and Risk Mitigation to Enterprise Clients",
         "An enterprise client is hesitant to adopt a customer support GenAI agent due to fear that the model will invent false legal policies.",
         "Define hallucinations technically (probabilistic next-token generation), and outline multi-layer mitigation: RAG, system prompt guardrails, and validation.",
         ["Hallucination", "Grounding", "Deterministic Guardrails"], "The Confidence Through Governance Framework (Acknowledge risk, explain root cause, prove multi-barrier defense)",
         "LLMs sometimes hallucinate because they are generative. But we can use ChatGPT prompts telling it to 'only answer from the document' to prevent it.",
         "Dismissive and fragile. Prompting alone cannot guarantee compliance in enterprise legal/financial domains.",
         "LLMs do not store factual knowledge like databases; they are probabilistic neural networks that predict the statistically most likely next word. When information is missing, they extrapolate plausibly—a phenomenon called hallucination. To eliminate this risk for your enterprise, we implement a three-tier defense: First, Retrieval-Augmented Generation (RAG) grounds every response in your verified policy documents; second, NeMo Guardrails intercept outputs and verify factual alignment against source citations; and third, any unverified response triggers a fallback to human specialists with 100% audit logging.",
         "Demystifies the phenomenon while providing an institutional, multi-layered architectural solution that reassures risk-averse enterprise leaders.",
         "Never promise 'zero hallucinations'; instead, promise a 'multi-barrier containment architecture' with automated human fallbacks.",
         "Profit, Margin & ROI", "LLM Inference Cost Optimization Through Prompt Caching",
         "A customer support LLM pipeline handles 200,000 queries monthly. Introducing prompt caching reduces input token API spend from $8,500/month to $3,400/month. What percentage cost savings is realized?",
         ["60%", "50%", "65%", "55%"], 0,
         "Calculation: Savings = $8,500 - $3,400 = $5,100. Percentage = ($5,100 / $8,500) * 100 = 60%.", "Savings % = (Savings / Original) * 100",
         "Constraint Solving", "Loss Function Selection for Multi-Class Classification",
         "You are training a neural network to classify satellite images into one of 10 mutually exclusive land categories. Which loss function and final layer activation function are mathematically required?",
         ["Softmax activation with Categorical Cross-Entropy loss",
          "Sigmoid activation with Binary Cross-Entropy loss",
          "Linear activation with Mean Squared Error (MSE) loss",
          "ReLU activation with Hinge loss"], 0,
         "For mutually exclusive multi-class classification, the final layer must use Softmax to output a valid probability distribution that sums to 1.0, paired with Categorical Cross-Entropy loss."),

        (5, "workplace-scenario", "Defending GPU Infrastructure Budget to Financial Controllers",
         "In budget planning, the finance controller asks why your team requested 4x NVIDIA A100 GPUs ($40k/yr) instead of standard CPU cloud instances.",
         "Articulate the mathematical necessity of massively parallel tensor matrix multiplication for deep learning training and inference latency.",
         ["Tensor Cores", "SIMD (Single Instruction Multiple Data)", "Inference Latency SLA"], "Hardware-Software Co-Design Justification (Connect matrix math to business latency SLAs)",
         "CPUs are too slow for deep learning. We need A100 GPUs because everyone in AI uses GPUs and PyTorch runs much better on CUDA.",
         "Entitled and non-technical. Does not explain the architectural difference between CPUs and GPUs or quantify the business impact.",
         "Deep learning models rely fundamentally on massive matrix multiplications containing billions of floating-point parameters. A high-end CPU has up to 64 cores optimized for complex sequential instructions. In contrast, an NVIDIA A100 GPU features over 6,900 CUDA cores and dedicated Tensor Cores designed for massively parallel Single-Instruction-Multiple-Data (SIMD) matrix operations. Running our recommendation model on CPUs takes 850ms per request—violating our 100ms user checkout SLA. The A100 executes inference in 18ms, enabling real-time personalization that directly drives our 14% conversion lift.",
         "Brilliant defense: contrasts CPU sequential cores with GPU parallel tensor units and links latency directly to conversion revenue.",
         "Always connect hardware specs (core count, memory bandwidth) to business operational metrics (latency SLA, revenue conversion).",
         "Time, Work & Capacity", "Distributed Data Parallel (DDP) Training Speedup",
         "Training an open-source 7B parameter LLM on a single GPU takes 120 hours. Utilizing PyTorch Distributed Data Parallel (DDP) across 8 GPUs achieves 85% linear scaling efficiency. How many hours will training take?",
         ["17.65 hours", "15.00 hours", "20.00 hours", "22.50 hours"], 0,
         "Calculation: Effective speedup = 8 GPUs * 0.85 = 6.8x. New Training Time = 120 / 6.8 = 17.65 hours.", "Parallel Time = Single Time / (Devices * Efficiency)",
         "Debugging Logic", "Diagnosing Exploding Gradients in Deep Neural Networks",
         "During training of a deep 50-layer Recurrent Neural Network, training loss suddenly outputs 'NaN' (Not a Number) at epoch 14. What is the root cause and standard remedy?",
         ["Exploding gradients; apply Gradient Clipping (e.g. torch.nn.utils.clip_grad_norm_) and reduce learning rate",
          "Vanishing gradients; replace all activation functions with Sigmoid units",
          "Underfitting; increase the number of layers and remove all normalization",
          "Data corruption; delete all negative values from the input feature tensors"], 0,
         "NaN loss in deep networks typically stems from exploding gradients where numerical overflow occurs during backpropagation. Gradient clipping caps the norm of the gradients at a maximum threshold, preventing mathematical instability."),
    ]

    for s in foundations:
        days.append({
            "day": s[0],
            "commType": s[1],
            "commTitle": s[2],
            "commScenario": s[3],
            "commPrompt": s[4],
            "commVocab": s[5],
            "commRule": s[6],
            "commWeakResponse": s[7],
            "commWeakCritique": s[8],
            "commStrongResponse": s[9],
            "commStrongCritique": s[10],
            "commCoachTip": s[11],
            "aptTopic": s[12],
            "aptTitle": s[13],
            "aptQuestion": s[14],
            "aptOptions": s[15],
            "aptAnswer": s[16],
            "aptExplanation": s[17],
            "aptFormula": s[18],
            "logicType": s[19],
            "logicTitle": s[20],
            "logicQuestion": s[21],
            "logicOptions": s[22],
            "logicAnswer": s[23],
            "logicExplanation": s[24],
        })

    # Detailed Systematic Curriculum for Days 6 to 89
    aiml_phases = [
        # Days 6-15: Supervised Learning & Classical ML
        (6, 15, "Classical Machine Learning", [
            ("Linear Regression Assumptions & Multicollinearity", "Regression Analysis", "Validating homoscedasticity, normality of residuals, and VIF variance inflation factor.", ["Multicollinearity", "VIF"]),
            ("Logistic Regression Log-Odds and Decision Boundary", "Classification", "Explaining how logit function transforms linear inputs into probability outputs [0, 1].", ["Sigmoid Function", "Log-Odds"]),
            ("Decision Trees: Gini Impurity vs Entropy", "Tree Models", "Calculating information gain and preventing tree overfitting via pre-pruning.", ["Information Gain", "Gini Index"]),
            ("Random Forests: Bagging & Out-of-Bag (OOB) Error", "Ensemble Methods", "Bootstrap aggregating and decorrelating trees with random feature subsets.", ["Bagging", "OOB Error"]),
            ("Gradient Boosting: XGBoost vs LightGBM Mechanics", "Boosting Architecture", "Iterative residual fitting, second-order Taylor expansion, and histogram binning.", ["Residual Fitting", "XGBoost"]),
            ("k-Means Clustering Centroid Convergence", "Unsupervised Learning", "Choosing optimal k with the Elbow Method and Silhouette Coefficient.", ["Elbow Method", "Silhouette Score"]),
            ("Principal Component Analysis (PCA) Dimensionality Reduction", "Feature Space", "Eigenvector decomposition of covariance matrix and explained variance ratio.", ["Eigenvalues", "Dimensionality"]),
            ("Support Vector Machines (SVM) & Kernel Trick", "Kernel Methods", "Transforming non-linear boundaries into higher dimensional hyperplanes.", ["Hyperplane", "RBF Kernel"]),
            ("Handling Severe Class Imbalance with SMOTE", "Data Resampling", "Synthetic Minority Over-sampling Technique vs cost-sensitive class weights.", ["SMOTE", "Class Weights"]),
            ("Phase 1 Placement Milestone: ML Algorithms Defense", "Technical Interview", "Explaining algorithmic selection and metric tradeoffs to principal data scientists.", ["Model Selection", "Tradeoff Analysis"]),
        ]),
        # Days 16-30: Deep Learning & Neural Architectures
        (16, 30, "Deep Learning & Neural Networks", [
            ("Multilayer Perceptron (MLP) Forward & Backpropagation", "Neural Foundations", "Chain rule gradient calculations and weight updates via backpropagation.", ["Backpropagation", "Chain Rule"]),
            ("Activation Functions: Dying ReLU vs LeakyReLU / GELU", "Network Dynamics", "Preventing dead neurons and saturation in deep multilayer networks.", ["Dying ReLU", "GELU"]),
            ("Optimizers: SGD vs Momentum vs AdamW", "Optimization", "Adaptive learning rates, first/second moment vectors, and decoupled weight decay.", ["AdamW", "Weight Decay"]),
            ("Regularization in Deep Learning: Dropout & LayerNorm", "Generalization", "Inverted dropout probability scaling and internal covariate shift stabilization.", ["Dropout", "LayerNorm"]),
            ("Convolutional Neural Networks (CNN): Filters, Strides & Pooling", "Computer Vision", "Spatial feature extraction, receptive fields, and downsampling.", ["Convolution", "Feature Map"]),
            ("Transfer Learning with ResNet and Vision Models", "Transfer Learning", "Feature extraction vs fine-tuning pre-trained ImageNet backbones.", ["Transfer Learning", "Frozen Weights"]),
            ("Recurrent Neural Networks (RNN) and Vanishing Gradients", "Sequential Models", "BPTT (Backpropagation Through Time) and temporal dependency limits.", ["BPTT", "Vanishing Gradient"]),
            ("Long Short-Term Memory (LSTM) & GRU Gating Mechanisms", "Sequence Memory", "Forget gate, input gate, cell state, and hidden state memory mechanics.", ["Cell State", "Forget Gate"]),
            ("Attention Mechanism Intuition: Bahdanau vs Luong", "Attention Models", "Aligning sequence contexts dynamically rather than compressing into static vectors.", ["Attention Weights", "Context Vector"]),
            ("PyTorch Custom Dataset and DataLoader Architecture", "Data Engineering", "Implementing __len__, __getitem__, and multi-worker pinned memory loading.", ["DataLoader", "Pinned Memory"]),
            ("PyTorch Training Loop: Zero_grad, Backward, Step", "Framework Mechanics", "Understanding gradient accumulation and optimizer step ordering.", ["zero_grad", "optimizer.step"]),
            ("Model Checkpointing and Early Stopping Strategies", "Training Control", "Monitoring validation loss patience and saving best model weights.", ["Early Stopping", "Model Checkpoint"]),
            ("Learning Rate Schedulers: Cosine Annealing with Warmup", "Convergence Speed", "Avoiding early local minima and achieving optimal asymptotic loss.", ["Cosine Annealing", "Warmup Schedule"]),
            ("Hyperparameter Tuning with Optuna & Bayesian Optimization", "AutoML", "Pruning unpromising trials with Tree-structured Parzen Estimators.", ["Optuna", "Bayesian Tuning"]),
            ("Phase 2 Placement Milestone: Deep Learning Architecture Review", "Architecture Defense", "Defending neural network design and training stability to AI directors.", ["Deep Learning", "Convergence"]),
        ]),
        # Days 31-45: Transformers & Large Language Models
        (31, 45, "Transformers & LLM Foundations", [
            ("Transformer Architecture: Self-Attention Mathematics", "Attention Theory", "Scaled dot-product attention: Q, K, V matrix projections and scaling factor sqrt(d_k).", ["Query Key Value", "Scaled Dot-Product"]),
            ("Multi-Head Attention: Parallel Representation Subspaces", "Transformer Core", "Projecting queries, keys, and values into multiple dimensional heads.", ["Multi-Head Attention", "Projection"]),
            ("Positional Encoding: Sinusoidal vs RoPE (Rotary Embeddings)", "Sequence Position", "Injecting token position awareness into permutation-invariant attention.", ["RoPE", "Positional Encoding"]),
            ("Encoder-Only vs Decoder-Only vs Encoder-Decoder LLMs", "LLM Families", "Comparing BERT (Masked LM) vs GPT (Causal LM) vs T5 (Seq2Seq).", ["Causal LM", "Encoder-Decoder"]),
            ("Tokenization Algorithms: Byte-Pair Encoding (BPE) & WordPiece", "Tokenization", "Subword vocabularies, token merging rules, and out-of-vocabulary handling.", ["BPE Tokenization", "Subword Vocabulary"]),
            ("KV Caching for Accelerated LLM Generation", "Inference Efficiency", "Caching Key and Value tensors to avoid quadratic recomputation during auto-regression.", ["KV Cache", "Auto-Regressive"]),
            ("Context Window Scaling: Sliding Window & FlashAttention", "Scaling Attention", "IO-aware GPU SRAM tiling algorithms to bypass memory bottlenecks.", ["FlashAttention", "SRAM Tiling"]),
            ("Sampling Strategies: Temperature, Top-p (Nucleus), Top-k", "Decoding Mechanics", "Controlling diversity vs determinism in next-token probability distribution.", ["Top-p Sampling", "Temperature"]),
            ("Prompt Engineering: Chain-of-Thought (CoT) & Few-Shot", "Prompt Architecture", "Structuring reasoning traces to elicit emergent problem-solving in LLMs.", ["Few-Shot", "Chain-of-Thought"]),
            ("Vector Embeddings: Dense Vectors & Semantic Proximity", "Representation", "Mapping text into high-dimensional latent space and calculating Cosine Distance.", ["Vector Embedding", "Cosine Similarity"]),
            ("Open Source LLMs: LLaMA 3, Mistral & DeepSeek Architecture", "Open Source AI", "Analyzing grouped-query attention (GQA) and mixture of experts (MoE).", ["GQA", "MoE"]),
            ("Hallucination Taxonomy: Factuality vs Faithfulness", "Model Reliability", "Differentiating intrinsic knowledge errors from context unfaithfulness.", ["Factuality", "Faithfulness"]),
            ("System Prompts & Instruction Following Alignment", "Steerability", "Structuring immutable system personas and negative constraints.", ["System Prompt", "Constraint Framing"]),
            ("Benchmarking LLMs: MMLU, GSM8K, and HumanEval", "Evaluation Standards", "Interpreting benchmark capabilities across reasoning, math, and coding.", ["MMLU Benchmark", "HumanEval"]),
            ("Phase 3 Placement Milestone: Transformer Mastery Defense", "Technical Interview", "Defending self-attention complexity and decoding strategies in an interview.", ["Self-Attention", "Decoding"]),
        ]),
        # Days 46-60: Retrieval-Augmented Generation (RAG) & Vector DBs
        (46, 60, "RAG & Vector Architecture", [
            ("RAG Architecture Blueprint: Ingestion, Retrieval, Generation", "RAG Systems", "Designing scalable retrieval pipelines connecting document stores to LLMs.", ["RAG Pipeline", "Information Retrieval"]),
            ("Chunking Strategies: Fixed-Size, Sentence, Semantic Chunking", "Data Ingestion", "Evaluating chunk size and overlap trade-offs on retrieval context density.", ["Semantic Chunking", "Chunk Overlap"]),
            ("Vector Database Indexing: HNSW vs IVF-Flat", "Vector Search", "Hierarchical Navigable Small World graphs vs Inverted File clustering.", ["HNSW Graph", "ANN Search"]),
            ("Hybrid Search: Combining Dense Vectors with BM25 Sparse Search", "Search Precision", "Reciprocal Rank Fusion (RRF) to capture both semantic and keyword matches.", ["Hybrid Search", "BM25 Sparse"]),
            ("Re-Ranking Retrieved Chunks with Cross-Encoders (Cohere)", "Retrieval Quality", "Scoring query-chunk pairs with cross-attention to elevate high-relevance context.", ["Cross-Encoder", "Re-Ranking"]),
            ("Metadata Filtering in Vector Databases (Pinecone / Chroma)", "Search Filtering", "Pre-filtering vs post-filtering by tenant ID, date, and document tags.", ["Metadata Filtering", "Tenant Isolation"]),
            ("Query Transformation: Sub-Queries, HyDE & Step-Back", "Query Expansion", "Hypothetical Document Embeddings (HyDE) and query decomposition.", ["HyDE", "Query Decomposition"]),
            ("Context Window Optimization: Context Compression & Trimming", "Context Economics", "Extracting relevant sentences from retrieved chunks to avoid token waste.", ["Context Compression", "Prompt Budget"]),
            ("Multi-Modal RAG: Text, Tables, and Image Ingestion", "Multi-Modal AI", "Parsing unstructured PDFs with tables using vision models and layout parsers.", ["Table Extraction", "Multi-Modal"]),
            ("Evaluating RAG with RAGAS (Context Recall, Faithfulness)", "RAG Evaluation", "Measuring generation quality without human ground truth labels.", ["RAGAS Framework", "Context Relevance"]),
            ("Handling Out-of-Domain Queries: Fallback & Abstention", "Safety & Guardrails", "Configuring threshold boundaries to say 'I do not have enough information'.", ["Model Abstention", "Threshold"]),
            ("Vector Database Sharding & High-Throughput Ingestion", "Infrastructure Scale", "Partitioning vector indexes across distributed nodes for low latency.", ["Vector Sharding", "QPS Throughput"]),
            ("GraphRAG: Knowledge Graphs Combined with Vector Embeddings", "Advanced RAG", "Entity-relation extraction and community summaries for global reasoning.", ["Knowledge Graph", "GraphRAG"]),
            ("Building Production RAG with LangChain / LlamaIndex", "Framework Integration", "Comparing component abstractions, index structures, and production observability.", ["LlamaIndex", "LangChain"]),
            ("Phase 4 Placement Milestone: Production RAG Defense", "System Defense", "Presenting a fault-tolerant, high-accuracy RAG architecture to enterprise CTOs.", ["Enterprise RAG", "Accuracy SLA"]),
        ]),
        # Days 61-75: AI Agents & Fine-Tuning
        (61, 75, "Agents & Fine-Tuning", [
            ("Autonomous AI Agents: ReAct Framework (Reason + Act)", "Agentic Systems", "Structuring Thought-Action-Observation loops for multi-step reasoning.", ["ReAct Framework", "Tool Calling"]),
            ("Function Calling & Tool Execution via Structured JSON", "API Integration", "Parsing schema contracts and executing external APIs securely.", ["Function Calling", "JSON Schema"]),
            ("Multi-Agent Orchestration: CrewAI vs AutoGen", "Multi-Agent Systems", "Hierarchical vs collaborative agent topologies with defined roles.", ["Multi-Agent", "Role Delegation"]),
            ("Agent Memory Architectures: Short-Term vs Long-Term Vector Store", "Agent State", "Conversation buffers, summarized history, and semantic retrieval memory.", ["Agent Memory", "State Persistence"]),
            ("Guardrails with NeMo & Llama Guard: Safety Moderation", "AI Governance", "Intercepting toxic inputs, PII leakage, and jailbreak attempts.", ["NeMo Guardrails", "PII Redaction"]),
            ("Fine-Tuning vs RAG: Architectural Decision Framework", "Model Strategy", "Determining when to customize model style/syntax versus retrieving fresh facts.", ["Fine-Tuning vs RAG", "Domain Adaptation"]),
            ("Parameter-Efficient Fine-Tuning (PEFT) and LoRA", "Efficient Fine-Tuning", "Low-Rank Adaptation: decomposing weight matrices into low-rank representations.", ["LoRA Adapter", "Rank r Parameter"]),
            ("QLoRA: 4-bit NormalFloat Quantization Fine-Tuning", "GPU Efficiency", "Fine-tuning 70B models on single consumer GPUs with NF4 and double quantization.", ["QLoRA", "4-Bit NF4"]),
            ("Data Preparation for Instruction Tuning (Alpaca / ShareGPT)", "Dataset Curation", "Synthesizing multi-turn instruction datasets and quality filtering.", ["Instruction Tuning", "Data Curation"]),
            ("Alignment with DPO (Direct Preference Optimization)", "Model Alignment", "Aligning LLMs with human preferences without complex RLHF reward models.", ["DPO", "Human Alignment"]),
            ("Quantization Formats: GGUF vs AWQ vs GPTQ", "Model Optimization", "Weight-only vs activation quantization for local and cloud serving.", ["AWQ", "GGUF"]),
            ("High-Throughput LLM Serving with vLLM (PagedAttention)", "Model Serving", "Eliminating GPU memory fragmentation with dynamic virtual paging.", ["vLLM", "PagedAttention"]),
            ("Prompt Injection & Jailbreak Defense Strategies", "Adversarial AI", "Defending against indirect prompt injections and system prompt extraction.", ["Prompt Injection", "Adversarial Defense"]),
            ("Observability for GenAI: Langfuse, Traces, and Cost Analytics", "AI Observability", "Tracking step-level latency, token usage, and user feedback loops.", ["Langfuse", "Trace Analytics"]),
            ("Phase 5 Placement Milestone: Agentic AI & Fine-Tuning Defense", "Enterprise Defense", "Presenting autonomous agent workflows and LoRA fine-tuning benchmarks.", ["Autonomous Agents", "LoRA Benchmark"]),
        ]),
        # Days 76-89: Production AI, MLOps & System Design
        (76, 89, "Production AI & System Design", [
            ("Production LLM Gateway Architecture: Rate Limiting & Fallbacks", "Gateway Design", "Routing between model providers (OpenAI, Anthropic, local vLLM) with cost rules.", ["Model Router", "Fallback Cascade"]),
            ("Speculative Decoding for Low-Latency Generation", "Inference Speedup", "Using small draft models to accelerate large target model verification.", ["Speculative Decoding", "Draft Model"]),
            ("Designing an Enterprise Copilot for Internal Knowledge (System Design)", "System Design", "Ingesting SharePoint, Confluence, and Slack with permission-aware RAG.", ["Enterprise Copilot", "ACL Permissions"]),
            ("Designing a Real-Time Recommendation System (System Design)", "System Design", "Two-stage retrieval and ranking with vector embeddings and gradient boosted trees.", ["Two-Stage Ranking", "Embedding Retrieval"]),
            ("Continuous Learning & Model Retraining Pipelines in MLOps", "MLOps Lifecycle", "Automating dataset validation, scheduled re-training, and model registry promotion.", ["Model Registry", "Data Drift"]),
            ("Feature Stores: Feast Architecture & Online/Offline Consistency", "Feature Store", "Synchronizing low-latency Redis online features with BigQuery offline stores.", ["Feature Store", "Point-in-Time Join"]),
            ("A/B Testing Machine Learning Models in Production", "Statistical Testing", "Interleaving search results and multi-armed bandit traffic allocation.", ["Multi-Armed Bandit", "Interleaving"]),
            ("Data Drift vs Concept Drift Detection (Evidently AI)", "Monitoring", "Measuring Population Stability Index (PSI) and Kolmogorov-Smirnov test.", ["Population Stability Index", "Concept Drift"]),
            ("AI Ethics, Bias Auditing, and Explainability (SHAP/LIME)", "AI Governance", "Decomposing feature contributions to audit racial/gender lending bias.", ["SHAP Values", "Bias Audit"]),
            ("Dockerizing GenAI Applications with CUDA Runtimes", "DevOps for AI", "Building multi-stage CUDA container images with minimal layer footprint.", ["NVIDIA Docker", "CUDA Runtime"]),
            ("Kubernetes AI Deployment with KServe and Ray", "Cloud AI", "Autoscaling GPU pods based on incoming request queue length.", ["KServe", "Ray Cluster"]),
            ("Behavioral STAR Interview: Resolving High-Stakes Model Hallucination", "Behavioral Interview", "Communicating rapid containment, root-cause isolation, and executive alignment.", ["STAR Technique", "Incident Management"]),
            ("Behavioral STAR Interview: Defending Build vs Buy GenAI Strategy", "Behavioral Interview", "Presenting TCO (Total Cost of Ownership) analysis between SaaS APIs and self-hosted open-source.", ["Build vs Buy", "TCO Analysis"]),
            ("System Design Interview: Autonomous Multi-Agent Research Assistant", "System Design", "Designing recursive search, web scraping, citation synthesis, and report compilation.", ["System Architecture", "Agent Orchestration"]),
        ]),
    ]

    for p_start, p_end, p_theme, p_days in aiml_phases:
        for idx, (t_title, t_topic, t_desc, t_vocab) in enumerate(p_days):
            d_num = p_start + idx
            if d_num > 89:
                break
            
            token_base = 1000 + d_num * 100
            gain_pct = 10 + (d_num % 15)
            result_tok = int(token_base * (1 + gain_pct / 100))

            days.append({
                "day": d_num,
                "commType": COMM_TYPES[d_num % len(COMM_TYPES)],
                "commTitle": t_title,
                "commScenario": f"During a production review for {t_title}, stakeholders request an architectural evaluation of {t_desc}.",
                "commPrompt": f"Explain the design trade-offs, accuracy benchmarks, and latency implications of {t_title} with precision.",
                "commVocab": [t_vocab[0], t_vocab[1]],
                "commRule": "Executive Technical Articulation & AI Architecture Clarity",
                "commWeakResponse": f"We just use {t_title} because it is the latest technique and works well in our notebook experiments.",
                "commWeakCritique": "Lacks production rigor, latency SLA validation, and enterprise governance considerations.",
                "commStrongResponse": f"In our enterprise deployment of {t_title}, we utilize {t_vocab[0]} and {t_vocab[1]} to guarantee verifiable accuracy, sub-100ms latency SLAs, and zero ungrounded hallucinations.",
                "commStrongCritique": "Demonstrates senior AI leadership by connecting algorithms directly to operational reliability and latency SLAs.",
                "commCoachTip": f"Highlight how {t_vocab[0]} establishes deterministic boundaries in probabilistic systems.",
                "aptTopic": APT_TOPICS[d_num % len(APT_TOPICS)],
                "aptTitle": f"{t_title} Token/Latency Math",
                "aptQuestion": f"An enterprise AI pipeline handles {token_base:,} tokens/sec. Deploying {t_title} increases throughput by {gain_pct}%. What is the new token processing throughput?",
                "aptOptions": [f"{result_tok:,} tokens/sec", f"{result_tok - 95:,} tokens/sec", f"{result_tok + 120:,} tokens/sec", f"{result_tok - 180:,} tokens/sec"],
                "aptAnswer": 0,
                "aptExplanation": f"Calculation: Increase = {token_base} * {gain_pct/100:.2f} = {result_tok - token_base}. New Throughput = {token_base} + {result_tok - token_base} = {result_tok:,} tokens/sec.",
                "aptFormula": "Throughput = Base * (1 + Gain %)",
                "logicType": LOGIC_TYPES[d_num % len(LOGIC_TYPES)],
                "logicTitle": f"{t_title} Workflow Constraint",
                "logicQuestion": f"When implementing {t_title}, which pipeline constraint must be strictly enforced to avoid system degradation?",
                "logicOptions": [
                    f"Ensure {t_vocab[0]} is validated and verified prior to downstream generation or model inference.",
                    f"Bypass {t_vocab[1]} completely to minimize latency at the cost of model hallucinations.",
                    "Execute all embeddings synchronously without indexing or vector sharding.",
                    "Disable temperature controls and rely on random token selection."
                ],
                "logicAnswer": 0,
                "logicExplanation": f"Correct! In {t_title}, establishing that {t_vocab[0]} is verified first guarantees grounded inference and protects system reliability.",
            })

    # Day 90: Final Placement Challenge
    days.append({
        "day": 90,
        "commType": "interview-question",
        "commTitle": "FINAL PLACEMENT CHALLENGE: Executive Enterprise GenAI Architecture Pitch",
        "commScenario": "You are presenting the final enterprise AI strategy before the Chief Technology Officer and the AI Governance Board for a Lead GenAI Architect position.",
        "commPrompt": "Deliver an end-to-end architecture presentation of a private, multi-tenant, autonomous AI agent platform that serves 10,000 enterprise employees, integrating hybrid RAG, LoRA fine-tuned open-source LLMs, and real-time NeMo safety guardrails.",
        "commVocab": ["Enterprise GenAI", "Agentic Orchestration", "Zero-Trust AI Governance"],
        "commRule": "Executive Presence, Enterprise Governance & End-to-End System Design",
        "commWeakResponse": "We will deploy an open-source LLM like LLaMA on a server, connect it to Pinecone with LangChain, and let employees chat with their documents.",
        "commWeakCritique": "Lacks enterprise tenancy isolation, PII sanitization, fine-tuning justification, latency benchmarks, and cost governance.",
        "commStrongResponse": "Our enterprise GenAI architecture implements a zero-trust multi-tier ecosystem: Incoming queries pass through an API Gateway with rate limiting and PII redaction via NeMo Guardrails. Retrieval leverages hybrid search combining HNSW vector indexes with BM25 keyword matching and Cohere cross-encoder reranking, maintaining strict document-level ACL permissions. For domain-specific workflows, we route requests to private 4-bit quantized LoRA adapters served on vLLM clusters with PagedAttention, achieving 35 tokens/sec per stream with 99.9% uptime compliance and zero data leakage to external SaaS APIs.",
        "commStrongCritique": "Flawless architecture defense: balances privacy, latency, throughput, governance, and business ROI with absolute command.",
        "commCoachTip": "In the final placement challenge, demonstrate complete command over privacy, serving infrastructure, and verifiable accuracy metrics.",
        "aptTopic": "Data Interpretation & Metrics",
        "aptTitle": "Final Assessment: Enterprise LLM GPU Cluster Sizing & Concurrency Math",
        "aptQuestion": "A corporate AI assistant expects 240 concurrent active users. Each user stream generates 25 tokens per second. An NVIDIA A100 server instance can sustain 1,500 generation tokens per second with PagedAttention. What is the minimum number of A100 instances required to handle peak concurrency?",
        "aptOptions": ["4 instances", "3 instances", "5 instances", "6 instances"],
        "aptAnswer": 0,
        "aptExplanation": "Calculation: Total required throughput = 240 users * 25 tokens/sec = 6,000 tokens/sec. Instances needed = 6,000 / 1,500 = 4.0 instances.",
        "aptFormula": "Instances = (Concurrency * Rate per user) / Capacity per instance",
        "logicType": "Decision Architecture",
        "logicTitle": "Final Assessment: Autonomous Multi-Agent Safety Constraint Logic",
        "logicQuestion": "An autonomous AI agent receives a tool-calling request to execute a database write operation based on an untrusted external web source. According to zero-trust AI architecture, what is the mandatory execution constraint?",
        "logicOptions": [
            "Intercept the execution with a Human-in-the-Loop (HITL) confirmation gate, requiring authenticated human approval before committing destructive database writes.",
            "Allow the agent to execute immediately to minimize latency, logging the action in a post-hoc audit file.",
            "Bypass the database write and terminate the agent session permanently.",
            "Execute the write operation in production and revert it later if an error is detected."
        ],
        "logicAnswer": 0,
        "logicExplanation": "Correct! Autonomous agent operations with external or destructive side effects must enforce Human-in-the-Loop (HITL) confirmation gates to prevent prompt injection and unauthorized state mutations.",
    })

    return days

print("aiml_data module ready.")
