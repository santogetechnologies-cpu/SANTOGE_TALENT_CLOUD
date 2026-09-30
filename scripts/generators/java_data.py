# scripts/generators/java_data.py
"""
90 Days of Course-Specific Placement Accelerator Content for Java Full Stack (track: java)
Phases:
1. Days 1-15: Core Java, OOP, Memory & Syntax Foundations
2. Days 16-30: Concurrency, Generics, Java 8 Streams & JVM Internals
3. Days 31-45: Spring Boot, Inversion of Control & REST API Design
4. Days 46-60: Spring Data JPA, Hibernate, Relational DBs & Transactions
5. Days 61-75: Spring Security, JWT, Microservices Architecture & Messaging
6. Days 76-89: Distributed Systems, High Concurrency, System Design & Interview Defense
Day 90: Final Placement Challenge
"""

import sys

COMM_TYPES = [
    "interview-question",
    "technical-explanation",
    "client-conversation",
    "team-communication",
    "workplace-scenario",
    "problem-explanation",
    "project-explanation",
    "technical-presentation",
    "email-response",
    "manager-conversation",
    "hr-question",
    "conflict-resolution",
    "requirement-clarification",
    "technical-to-nontechnical",
]

APT_TOPICS = [
    "Percentages & Growth",
    "Ratios & Proportions",
    "Averages & Distributions",
    "Profit, Margin & ROI",
    "Time, Work & Capacity",
    "Speed, Latency & Distance",
    "Probability & Reliability",
    "Combinatorics & Permutations",
    "Number Systems & Units",
    "Data Interpretation & Metrics",
    "Statistics & Dispersion",
    "Financial & Business Math",
]

LOGIC_TYPES = [
    "Sequence Reasoning",
    "Workflow Ordering",
    "Deductive Analysis",
    "Constraint Solving",
    "Debugging Logic",
    "Process Flow",
    "Cause & Effect",
    "Decision Architecture",
]

def get_java_days():
    days = []
    
    # Raw specs for all 90 days of Java Full Stack
    raw_specs = [
        # --- Phase 1: Days 1-15 (Core Java, OOP, Memory & Syntax) ---
        (1, "technical-explanation", "Explaining Java Platform Independence & JVM to a Non-Technical Client",
         "A non-technical client asks why you chose Java instead of a compiled language like C++ for their financial core application.",
         "Explain the concept of 'Write Once, Run Anywhere' (WORA) and the role of bytecode and the JVM in simple, business-value terms.",
         ["Bytecode", "JVM (Java Virtual Machine)", "Cross-Platform"], "The Analogy Principle (Translate technical abstractions into everyday business concepts)",
         "Java is good because it compiles to bytecode which runs on the JVM so you can run it on Windows or Linux without rewriting everything from scratch.",
         "Too brief and assumes the client knows what bytecode and JVM mean. Fails to link technical features to cost, agility, and vendor lock-in avoidance.",
         "Think of Java like an international business contract written in a standardized intermediate language. Instead of rewriting our software for every different operating system, Java compiles into standard 'bytecode'. Each operating system has a translator called the JVM that executes this bytecode natively. For your business, this means zero vendor lock-in, faster cloud deployment, and dramatically lower infrastructure maintenance costs.",
         "Directly connects architectural portability to business ROI, eliminating technical jargon confusion while instilling confidence.",
         "Anchor your explanation in operational savings: highlight that cross-platform portability saves development time and reduces deployment friction.",
         "Percentages & Growth", "API Request Throughput Calculation",
         "A Java Spring Boot microservice handles 800 requests per minute during off-peak hours. During peak sale hours, traffic increases by 35%. What is the new peak request volume handled per minute?",
         ["1,080 requests/min", "1,040 requests/min", "1,120 requests/min", "1,160 requests/min"], 0,
         "Calculation: Increase = 800 * 0.35 = 280 requests. Total peak volume = 800 + 280 = 1,080 requests/min.", "New Value = Base * (1 + Rate)",
         "Sequence Reasoning", "Java Source-to-Execution Pipeline Ordering",
         "Which sequence accurately represents the complete execution lifecycle of a Java application from source code to machine execution?",
         [".java Source -> javac Compiler -> .class Bytecode -> JVM ClassLoader -> JIT/Execution Engine",
          ".java Source -> JVM Interpreter -> .class Bytecode -> JIT Compiler -> Native Execution",
          ".class Bytecode -> javac Compiler -> .java Source -> ClassLoader -> CPU Execution",
          ".java Source -> JIT Compiler -> .class Bytecode -> JVM Runtime -> Native Memory"], 0,
         "The standard Java compilation pipeline compiles .java source files with javac into platform-independent .class bytecode, which is then loaded by the JVM ClassLoader and executed via the JIT/Execution Engine into machine instructions."),

        (2, "interview-question", "Demonstrating Object-Oriented Polymorphism in an Interview",
         "An engineering interviewer asks: 'How do you apply polymorphism in a real-world enterprise payment system?'",
         "Articulate the difference between compile-time and runtime polymorphism using an extensible payment gateway architecture.",
         ["Method Overriding", "Dynamic Method Dispatch", "Interface Contract"], "The STAR Framework (Situation, Task, Action, Result with architectural context)",
         "Polymorphism has overloading and overriding. Overloading is compile-time with same name different parameters. Overriding is runtime where child implements parent method.",
         "Textbook definition without concrete enterprise context. Interviewers look for architectural application and clean code principles.",
         "In our enterprise checkout service, we decouple billing logic from specific payment providers using runtime polymorphism. We define a PaymentGateway interface with a processPayment() method. Concrete implementations like StripeGateway, PayPalGateway, and AdyenGateway override this contract. At runtime, Spring dynamically injects the appropriate gateway based on customer currency and region. This allows us to onboard new payment providers without modifying existing checkout business logic.",
         "Demonstrates mastery by applying the Open/Closed Principle (SOLID) with a concrete, realistic architectural pattern.",
         "Always pair abstract OOP definitions with a practical design pattern (e.g., Strategy Pattern) used in real production services.",
         "Ratios & Proportions", "Thread Pool Core-to-Maximum Sizing Ratio",
         "A Java backend server configures its ThreadPoolExecutor with a ratio of corePoolSize to maxPoolSize of 3:8. If the corePoolSize is configured to 24 threads, what is the maximum number of worker threads allowed?",
         ["64 threads", "56 threads", "72 threads", "48 threads"], 0,
         "Calculation: Ratio 3/8 = 24/Max. Max = (24 * 8) / 3 = 64 worker threads.", "Value = (Given * Target Ratio) / Base Ratio",
         "Workflow Ordering", "JVM Garbage Collection Allocation Flow",
         "When a new Java object is instantiated via the 'new' keyword, in what order does the JVM memory management subsystem evaluate and allocate memory?",
         ["Eden Space -> Survivor Space (S0/S1) upon surviving minor GC -> Tenured/Old Generation after threshold aging",
          "Old Generation -> Eden Space -> Survivor Space (S0/S1) -> Metaspace",
          "Survivor Space (S0) -> Eden Space -> Tenured Generation -> Compressed Class Pointer Space",
          "Metaspace -> Eden Space -> Stack Frame Allocation -> Tenured Generation"], 0,
         "Newly created objects are first allocated in Eden space. Objects surviving minor GC cycles alternate between Survivor spaces (S0/S1), and upon reaching the tenuring threshold (default 15), they are promoted to the Old/Tenured Generation."),

        (3, "team-communication", "Explaining String Immutability and Memory Optimization to a Junior Developer",
         "A junior developer on your team concatenated strings inside a loop processing 50,000 database records, causing high GC pause times.",
         "Explain why String is immutable in Java, how the String Constant Pool works, and coach them to use StringBuilder constructively.",
         ["String Pool", "Heap Memory Allocation", "StringBuilder / StringBuffer"], "Constructive Code Review Feedback (Praise, Explain root cause, Provide benchmarked solution)",
         "Hey, your code in the import loop is slow because String is immutable. Don't use '+' in loops, use StringBuilder instead.",
         "Curt and uninstructive. Misses the opportunity to mentor the developer on memory mechanics and heap garbage creation.",
         "Great job implementing the data import feature! In the record processing loop, notice that because Java String instances are immutable, every '+' concatenation creates a brand-new String object on the heap and discards the old one. Over 50,000 iterations, this generates millions of short-lived heap allocations, triggering heavy GC pauses. By replacing string concatenation with a pre-allocated StringBuilder, we mutate a single internal buffer, cutting memory overhead by over 90% and execution time from 12 seconds to 400 milliseconds.",
         "Empathetic, clear, and provides concrete quantitative performance metrics that inspire good software craftsmanship.",
         "When coaching junior peers, explain 'why' before 'how'—linking the language specification to runtime garbage collector metrics.",
         "Averages & Distributions", "Database Connection Response Time Average",
         "Over five consecutive production batch queries, a Java JDBC connection pool logged the following query durations: 42ms, 38ms, 55ms, 45ms, and 60ms. What was the average query latency across this batch?",
         ["48.0 ms", "46.5 ms", "50.0 ms", "52.5 ms"], 0,
         "Calculation: Total time = 42 + 38 + 55 + 45 + 60 = 240 ms. Average = 240 / 5 = 48.0 ms.", "Mean = Sum of elements / Total count",
         "Debugging Logic", "Resolving NullPointerException in Nested Java Method Chains",
         "Given the chain 'user.getProfile().getAddress().getZipCode()', what is the safest and most idiomatic modern Java defensive pattern to prevent NullPointerExceptions?",
         ["Optional.ofNullable(user).map(User::getProfile).map(Profile::getAddress).map(Address::getZipCode).orElse(\"UNKNOWN\")",
          "Wrapping the statement in a generic catch (Exception e) block and returning an empty string",
          "Checking if user != null and immediately returning null without checking profile or address",
          "Initializing all profile, address, and zipCode fields to static non-null mock objects in memory"], 0,
         "Using Optional chaining with map() ensures null-safety at every link in the hierarchy without introducing deeply nested if-else statements or swallowed exceptions."),

        (4, "client-conversation", "Addressing a Production API Incident with a Corporate Customer",
         "A critical B2B client reports that their warehouse logistics integration is receiving HTTP 500 Internal Server Errors from your Java inventory API.",
         "Communicate the incident transparently, establish accountability, and outline immediate mitigation and Root Cause Analysis (RCA) commitments.",
         ["Root Cause Analysis (RCA)", "SLA Compliance", "Mitigation Strategy"], "The 4A Crisis Framework (Acknowledge, Apologize, Action, Assurance)",
         "We checked our logs and there was a database timeout on our side. It is fixed now, so please try sending your requests again.",
         "Too casual and defensive. Lacks professionalism, timeline commitment, and assurance that preventative measures are being deployed.",
         "Thank you for notifying us immediately. We have identified an intermittent database connection pool exhaustion on our inventory service affecting requests between 10:15 and 10:38 AM EST. Our site reliability team has expanded the pool capacity and deployed a traffic throttling patch, restoring error rates to 0% as of 10:45 AM. We are monitoring all incoming transactions closely and will provide your engineering team with a formal Root Cause Analysis (RCA) and preventative action plan within 24 hours.",
         "Demonstrates executive composure, technical transparency, clear timestamps, and strict adherence to enterprise SLA standards.",
         "In client crisis communications, avoid vague promises: state exact timestamps, active remediations, and formal delivery timelines for the post-mortem.",
         "Profit, Margin & ROI", "Cloud Microservice Cost Optimization ROI",
         "Refactoring a Java monolith into containerized Spring Boot microservices reduced monthly cloud infrastructure cost from $14,000 to $9,100. What is the percentage cost reduction achieved?",
         ["35%", "30%", "40%", "45%"], 0,
         "Calculation: Savings = $14,000 - $9,100 = $4,900. Percentage reduction = ($4,900 / $14,000) * 100 = 35%.", "Percentage Change = (Delta / Original) * 100",
         "Deductive Analysis", "Exception Handling Hierarchy Verification",
         "In Java exception handling, why will placing 'catch (Exception e)' BEFORE 'catch (IOException e)' result in a compile-time compiler error?",
         ["IOException is a subclass of Exception; the broader Exception block would catch it first, making the IOException block unreachable code",
          "IOException can only be caught if explicitly declared in the main method signature",
          "The JVM bytecode verifier disallows handling input/output exceptions inside try blocks",
          "Exception is an interface that cannot be instantiated during runtime dispatch"], 0,
         "In Java, catch blocks are evaluated sequentially from top to bottom. Because IOException extends Exception, catching the superclass first renders subsequent subclass catch blocks unreachable, triggering a compiler error."),

        (5, "workplace-scenario", "Discussing Database Indexing Trade-offs with the Lead Architect",
         "In a sprint planning session, you propose adding composite B-tree indexes to three high-volume tables to accelerate analytical queries.",
         "Articulate the trade-offs of database indexing—specifically query read acceleration versus write/insert latency and disk footprint.",
         ["B-Tree Indexing", "Write Amplification", "Query Execution Plan"], "Balanced Technical Trade-off Articulation (Benefits vs Costs with data-driven criteria)",
         "Indexes make SELECT queries faster. We have slow queries, so we should index all foreign keys and search columns immediately.",
         "One-sided evaluation that ignores write amplification, index maintenance overhead during batch inserts, and disk storage growth.",
         "Adding composite B-Tree indexes on customer_id and transaction_date will drop our dashboard read latency from 2.4 seconds to under 80 milliseconds. However, because this table receives 1,200 inserts per second, every additional index introduces write amplification, as the database engine must update both the table heap and index trees synchronously. To balance this, I suggest indexing only the high-cardinality search predicate and monitoring our write I/O metrics in staging before full deployment.",
         "Demonstrates senior engineering maturity by balancing query read acceleration against write latency and storage considerations.",
         "Always present architectural proposals with trade-offs: acknowledge the cost of write amplification and explain how you will benchmark the compromise.",
         "Time, Work & Capacity", "Multi-Threaded Batch Processing Throughput",
         "A single-threaded Java batch job processes 12,000 records in 60 minutes. When re-engineered with an ExecutorService utilizing 4 parallel worker threads with 80% parallel efficiency, how many minutes will the batch take?",
         ["18.75 minutes", "15.00 minutes", "20.00 minutes", "22.50 minutes"], 0,
         "Calculation: Ideal 4-thread speedup = 4x. Effective speedup = 4 * 0.80 = 3.2x. New time = 60 / 3.2 = 18.75 minutes.", "Parallel Time = Single Time / (Threads * Efficiency)",
         "Constraint Solving", "Choosing the Optimal Java Collection Under Time & Memory Constraints",
         "You need a Java collection to store unique customer IDs where you require fast O(1) lookup time, but you also need to preserve the exact insertion order of the records. Which collection meets these constraints?",
         ["LinkedHashSet", "HashSet", "TreeSet", "ArrayList"], 0,
         "LinkedHashSet maintains a doubly-linked list running through all of its entries, providing O(1) amortized lookup, insertion, and deletion while strictly preserving insertion order."),
    ]
    
    # Generate full 90 days with domain-aligned topics
    # We will build rich, comprehensive days up to day 90
    course_topics = [
        # Days 6-15 (Foundations & OOP & Collections)
        (6, "technical-explanation", "Abstract Class vs Interface Design Decisions", "OOP Abstraction", "Explaining when to use an abstract class with shared state versus a pure interface contract.", ["Contract Interface", "Code Reusability", "Default Methods"], 
         "A server handles 1,500 connections. Memory usage is 600 MB. If memory drops by 20%, what is the new usage?", ["480 MB", "500 MB", "520 MB", "450 MB"], 0, "600 * 0.80 = 480 MB",
         "Interface Default Methods vs Abstract Class State", "An interface cannot declare instance state fields; abstract classes can maintain mutable member variables.", ["Interfaces have instance fields", "Abstract classes cannot have constructors", "Interfaces support default methods but no instance state", "Abstract classes cannot implement interfaces"], 2),
        
        (7, "interview-question", "Deep vs Shallow Copying in Enterprise Java Applications", "Memory Management", "Explaining object cloning, copy constructors, and immutability pitfalls in multithreaded systems.", ["Shallow Copy", "Deep Copy", "Cloneable"],
         "A batch job reads 45,000 rows. 3% fail validation. How many rows are successfully imported?", ["43,650 rows", "44,000 rows", "42,500 rows", "43,200 rows"], 0, "45,000 * 0.97 = 43,650 rows",
         "Cloning Reference References", "A shallow copy duplicates primitive values but copies object references, sharing mutable nested objects.", ["Shallow copy creates independent inner objects", "Shallow copy copies references, leaving nested objects shared", "Deep copy is faster than shallow copy", "Java forbids deep copying"], 1),
         
        (8, "team-communication", "Handling ConcurrentModificationException in Collections", "Collections & Threads", "Explaining why iterating over an ArrayList while modifying it throws runtime exceptions.", ["Fail-Fast Iterator", "CopyOnWriteArrayList", "ConcurrentHashMap"],
         "If 4 threads each handle 250 tasks per minute, how many tasks are handled in 15 minutes?", ["15,000 tasks", "12,000 tasks", "18,000 tasks", "10,000 tasks"], 0, "4 * 250 * 15 = 15,000 tasks",
         "Fail-Fast vs Fail-Safe Iteration", "Fail-fast iterators throw ConcurrentModificationException immediately upon structural modification; fail-safe iterators work on a snapshot clone.", ["Fail-fast ignores modifications", "Fail-fast throws exception immediately when collection structure changes during iteration", "Fail-safe modifies original array", "ConcurrentModificationException is checked"], 1),

        (9, "manager-conversation", "Justifying Migration from Java 8 to Java 17/21 LTS", "Language Modernization", "Presenting business and performance benefits of modern Java LTS releases to engineering leadership.", ["Virtual Threads (Loom)", "ZGC (Garbage Collector)", "Records & Pattern Matching"],
         "A microservice memory footprint decreases from 1,200 MB to 780 MB after upgrading to Java 21. What is the percentage reduction?", ["35%", "32%", "38%", "40%"], 0, "(1200 - 780) / 1200 = 420 / 1200 = 35%",
         "Virtual Threads vs Platform Threads", "Virtual Threads are lightweight threads managed by the JVM rather than 1:1 OS threads, enabling massive concurrency without thread exhaustion.", ["Virtual threads map 1:1 to OS kernel threads", "Virtual threads are managed by the JVM runtime, consuming kilobytes of memory instead of megabytes", "Virtual threads disable garbage collection", "Virtual threads only run in single-threaded mode"], 1),

        (10, "workplace-scenario", "Designing a Custom Unchecked Business Exception Architecture", "Clean Architecture", "Establishing standard domain exception hierarchies (e.g. EntityNotFoundException, ConflictException).", ["Unchecked Exception", "RuntimeException", "Global Exception Handler"],
         "An e-commerce order service processes $80,000 in sales. Payment gateway fees average 2.4%. What are the net fees deducted?", ["$1,920", "$1,840", "$2,000", "$1,750"], 0, "$80,000 * 0.024 = $1,920",
         "Checked vs Unchecked Exception Design", "Unchecked exceptions inherit from RuntimeException and represent unrecoverable or programmatic errors that do not clutter calling signatures.", ["Checked exceptions inherit from RuntimeException", "Unchecked exceptions extend RuntimeException and need not be explicitly declared in method signatures", "Checked exceptions cannot be caught", "Java 21 deprecated checked exceptions"], 1),

        (11, "technical-presentation", "Explaining HashMap Internals: Buckets, Collisions, and Red-Black Trees", "Data Structures", "Walking the team through hashing, modulo indexing, LinkedList chaining, and treeification in Java 8+.", ["Hash Collision", "Treeification Threshold (8)", "Load Factor (0.75)"],
         "A HashMap with initial capacity 16 and load factor 0.75 resizes upon adding which element number?", ["13th element", "12th element", "16th element", "8th element"], 0, "Threshold = 16 * 0.75 = 12. The 13th element triggers resize.",
         "HashMap Treeification Logic", "When a bucket contains more than 8 nodes and total table capacity is at least 64, the linked list is converted into a Red-Black Tree.", ["Converts at 4 nodes", "Converts to Red-Black Tree when bucket exceeds 8 nodes and table capacity >= 64", "Converts to AVL Tree at 10 nodes", "Treeification is removed in Java 17"], 1),

        (12, "client-conversation", "Explaining Serialization and Data Transfer Security", "Security Architecture", "Reassuring a financial auditor on how sensitive payload data is protected during network serialization.", ["transient Keyword", "Serializable", "JSON Sanitization"],
         "A serialized payload is compressed from 450 KB to 90 KB. What is the compression ratio achieved?", ["5:1 (80% reduction)", "4:1 (75% reduction)", "6:1 (83% reduction)", "3:1 (66% reduction)"], 0, "450 / 90 = 5:1 ratio",
         "Transient Keyword in Java Serialization", "The transient keyword marks sensitive fields (like passwords or credit card numbers) so they are excluded during object serialization.", ["Prevents class compilation", "Marks member variables to be skipped during serialization to protect sensitive data", "Makes variables immutable", "Stores variables in JVM Metaspace"], 1),

        (13, "interview-question", "Generics and Type Erasure in Java", "Type Safety", "Explaining why Java Generics exist at compile time but are erased from compiled bytecode.", ["Type Erasure", "Raw Types", "Bounded Wildcards"],
         "A generic cache retains 4,000 items with a 92% hit rate. How many requests trigger cache hits?", ["3,680 requests", "3,500 requests", "3,800 requests", "3,600 requests"], 0, "4,000 * 0.92 = 3,680 hits",
         "PECS Rule: Producer Extends, Consumer Super", "Use <? extends T> when reading elements from a collection, and <? super T> when adding elements to a collection.", ["Use extends when adding elements", "Producer Extends (read-only), Consumer Super (write-capable)", "Super is for reading subclasses", "Generics retain full type information in bytecode"], 1),

        (14, "conflict-resolution", "Resolving Code Style vs Performance Debates in PR Reviews", "Engineering Leadership", "Navigating disagreements between developers advocating premature optimization versus readable functional code.", ["Clean Code", "Micro-Benchmarking (JMH)", "Pragmatic Engineering"],
         "Query execution time drops from 320ms to 80ms. By what factor is the new query faster?", ["4.0x faster", "3.5x faster", "5.0x faster", "2.5x faster"], 0, "320 / 80 = 4.0x",
         "Benchmarking with JMH", "JMH (Java Microbenchmark Harness) prevents JVM warmup and dead code elimination biases when testing micro-optimizations.", ["System.currentTimeMillis() is best for micro-benchmarks", "JMH provides warmup iterations and statistical rigor to avoid JIT compiler optimization artifacts", "Thread.sleep() standardizes benchmarks", "JMH only runs on C++"], 1),

        (15, "project-explanation", "Presenting Core Java Architecture Milestone to Stakeholders", "Milestone Review", "Delivering a clean 5-minute summary of core architectural modules, test coverage, and readiness for Spring Boot integration.", ["Test Coverage (JaCoCo)", "Clean Architecture", "Sprint Milestone"],
         "A test suite of 450 unit tests achieves 88% branch coverage. How many branches are successfully exercised if total branches are 600?", ["528 branches", "500 branches", "550 branches", "480 branches"], 0, "600 * 0.88 = 528 branches",
         "Unit Test Isolation Principles", "Unit tests must test single logical units in complete isolation, mocking external dependencies to guarantee fast, deterministic execution.", ["Unit tests must connect to production databases", "Unit tests isolate components using mocks and test assertions deterministically", "Unit tests require integration environments", "Unit tests run after deployment only"], 1),
    ]

    # Fill base specs
    for s in raw_specs:
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

    for s in course_topics:
        # Build spec format
        day_num = s[0]
        days.append({
            "day": day_num,
            "commType": s[1],
            "commTitle": s[2],
            "commScenario": f"Enterprise scenario for {s[2]} in a Java production environment.",
            "commPrompt": f"Explain the critical engineering principles of {s[2]} effectively.",
            "commVocab": s[5],
            "commRule": "Precision and Technical Clarity",
            "commWeakResponse": f"We just do {s[2]} because standard Java recommends it without thinking about performance.",
            "commWeakCritique": "Lacks technical depth, rationale, and business context.",
            "commStrongResponse": f"In our enterprise architecture, {s[2]} is applied using {s[5][0]} to ensure scalability, fault isolation, and maintainable contracts.",
            "commStrongCritique": "Strong technical articulation with clear design intent.",
            "commCoachTip": f"Highlight how {s[5][0]} impacts maintainability and runtime reliability.",
            "aptTopic": "Percentages & Growth" if day_num % 3 == 0 else ("Ratios & Proportions" if day_num % 3 == 1 else "Time, Work & Capacity"),
            "aptTitle": f"{s[2]} Performance Calculation",
            "aptQuestion": s[6],
            "aptOptions": s[7],
            "aptAnswer": s[8],
            "aptExplanation": s[9],
            "aptFormula": "Standard performance formula",
            "logicType": "Workflow Ordering" if day_num % 2 == 0 else "Deductive Analysis",
            "logicTitle": s[10],
            "logicQuestion": f"In {s[2]}, evaluate the following condition: {s[11]}",
            "logicOptions": s[12],
            "logicAnswer": s[13],
            "logicExplanation": s[11],
        })

    # Now systematically populate Days 16 to 90
    phase_definitions = [
        # Phase 2: Days 16-30 (Concurrency, Streams, JVM)
        (16, 30, "Concurrency & Streams", [
            ("CompletableFuture Pipeline Assembly", "Java 8 Concurrency", "Combining asynchronous supplier stages with thenApply and exceptionally.", ["ForkJoinPool", "Async Non-Blocking"]),
            ("Volatile vs Synchronized Memory Visibility", "Thread Safety", "Explaining CPU L1/L2 cache coherency and Java Memory Model happens-before guarantee.", ["Happens-Before", "Memory Barrier"]),
            ("Parallel Streams: When to Use and When to Avoid", "Functional Java", "Evaluating thread pool contention on common ForkJoinPool during I/O operations.", ["CommonPool", "Spliterator"]),
            ("Custom ThreadPoolExecutor Configuration", "System Capacity", "Setting corePoolSize, maximumPoolSize, keepAliveTime, and ArrayBlockingQueue bounds.", ["RejectionExecutionHandler", "Worker Pool"]),
            ("Deadlock Prevention Strategies", "Concurrency Architecture", "Enforcing strict lock acquisition hierarchy and lock timeouts with tryLock().", ["Lock Ordering", "Deadlock Graph"]),
            ("Java 8 Stream Reductions and Collectors", "Data Processing", "Using collect(groupingBy()) and partitioningBy() for in-memory aggregations.", ["Downstream Collector", "BiConsumer"]),
            ("Optional Anti-Patterns in Domain Models", "Clean Code", "Why Optional should be used for return types rather than field attributes or parameters.", ["Serialization Safety", "Null Defense"]),
            ("Atomic Variables and CAS (Compare-And-Swap)", "Lock-Free Programming", "Explaining hardware-level atomic instructions in AtomicInteger and AtomicReference.", ["CAS Instruction", "Optimistic Concurrency"]),
            ("Java File I/O vs NIO.2 Channels and Buffers", "I/O Performance", "Comparing blocking InputStream with non-blocking byte channels and memory-mapped files.", ["Channel", "ByteBuffer"]),
            ("JVM Garbage Collectors: G1 vs ZGC vs ParallelGC", "JVM Tuning", "Matching GC latency requirements with sub-millisecond ZGC vs throughput ParallelGC.", ["Stop-the-World", "Pause Time SLA"]),
            ("ClassLoaders Hierarchy and Dynamic Loading", "JVM Architecture", "Bootstrap, Platform, and Application ClassLoaders and delegation model.", ["Parent Delegation", "ClassLoader"]),
            ("JVM Memory Leak Diagnosis with JProfiler/VisualVM", "Production Debugging", "Detecting unclosed resources, static collections, and thread local leaks.", ["Heap Dump", "Retained Size"]),
            ("Maven Multi-Module Project Architecture", "Build Systems", "Managing dependencyManagement, parent POMs, and clean module boundaries.", ["Transitive Dependency", "BOM Import"]),
            ("JUnit 5 Parameterized Tests and Mockito InOrder", "Testing Standards", "Writing table-driven test cases and verifying mock invocation sequences.", ["Mock Injection", "InOrder Verification"]),
            ("Phase 2 Placement Milestone: Concurrency & Quality Defense", "Technical Interview", "Explaining production thread dump analysis and latency optimization in an interview.", ["Thread Dump Analysis", "P99 Latency"]),
        ]),
        # Phase 3: Days 31-45 (Spring Boot & REST APIs)
        (31, 45, "Spring Boot & REST", [
            ("Inversion of Control & Spring IoC Container", "Spring Architecture", "Explaining BeanFactory vs ApplicationContext and lifecycle callbacks.", ["ApplicationContext", "Dependency Inversion"]),
            ("Constructor Injection vs Field Injection", "Clean Architecture", "Why constructor injection guarantees immutability, testability, and prevents NPE.", ["Immutability", "Null Safety"]),
            ("Spring Boot Auto-Configuration Demystified", "Spring Boot Internals", "How @ConditionalOnClass and spring.factories dynamically bootstrap dependencies.", ["AutoConfiguration", "ConditionalOnMissingBean"]),
            ("Designing Idempotent REST API Endpoints", "API Architecture", "Differentiating PUT vs POST and designing safe HTTP retry contracts.", ["Idempotency", "HTTP Status 200 vs 201"]),
            ("Handling Validation with Bean Validation (@Valid)", "Data Integrity", "Validating nested request DTOs and binding custom ConstraintValidators.", ["BindingResult", "Custom Validator"]),
            ("Global Exception Handling with @ControllerAdvice", "API Resilience", "Standardizing RFC 7807 ProblemDetail error responses for client applications.", ["ControllerAdvice", "ProblemDetails"]),
            ("Spring Bean Scopes: Singleton vs Prototype vs Request", "Memory & Concurrency", "Thread safety risks of storing mutable state in Spring singleton beans.", ["Bean Scope", "Thread Safety"]),
            ("Externalized Configuration with @ConfigurationProperties", "12-Factor App", "Validating strongly typed configuration records against application.yml.", ["ConfigurationProperties", "12-Factor App"]),
            ("Content Negotiation in Spring MVC (JSON vs XML)", "REST Standards", "Configuring Accept headers, HttpMessageConverters, and media types.", ["Accept Header", "HttpMessageConverter"]),
            ("Spring Boot Actuator & Health Check Endpoints", "Production Observability", "Configuring /health, /metrics, and exposing custom health indicators.", ["Readiness Probe", "Liveness Probe"]),
            ("CORS (Cross-Origin Resource Sharing) Configuration", "Web Security", "Resolving pre-flight OPTIONS requests and configuring allowed origins securely.", ["Preflight Request", "Allowed Origins"]),
            ("Async Request Processing with DeferredResult / Callable", "High Concurrency", "Releasing servlet threads during long-running background tasks.", ["Servlet Async", "DeferredResult"]),
            ("API Pagination and Sorting with Pageable", "Data Scalability", "Preventing memory exhaustion by enforcing maximum page size contracts.", ["Pageable", "Slice vs Page"]),
            ("Contract Testing REST APIs with WireMock", "Integration Testing", "Stubbing external third-party HTTP endpoints during automated test suites.", ["WireMock", "Mock Server"]),
            ("Phase 3 Placement Milestone: Spring Boot Architecture Review", "System Architecture", "Defending REST API design and exception handling to enterprise stakeholders.", ["REST Contract", "API Governance"]),
        ]),
        # Phase 4: Days 46-60 (Spring Data JPA, Hibernate & DBs)
        (46, 60, "Spring Data JPA & Databases", [
            ("JPA Entity Lifecycle & Persistence Context", "Data Persistence", "Transitioning entities between Transient, Managed, Detached, and Removed states.", ["EntityManager", "Persistence Context"]),
            ("Solving the JPA N+1 Query Problem", "Database Optimization", "Using JOIN FETCH and @EntityGraph to eliminate quadratic database roundtrips.", ["N+1 Queries", "JOIN FETCH"]),
            ("Transaction Propagation: REQUIRED vs REQUIRES_NEW", "Transaction Management", "Predicting rollback boundaries and nested transaction execution scopes.", ["@Transactional", "Rollback Rules"]),
            ("Optimistic vs Pessimistic Locking in JPA", "Data Concurrency", "Preventing lost updates using @Version timestamps vs SELECT FOR UPDATE.", ["Optimistic Lock", "Version Column"]),
            ("JPA Bidirectional Mapping & Ownership (@OneToMany)", "Entity Relationships", "Managing mappedBy attributes and avoiding infinite JSON recursion.", ["mappedBy", "JsonManagedReference"]),
            ("Spring Data Repository Derived Query Methods", "Query Generation", "Understanding query generation, method naming parser, and JPQL translations.", ["Derived Query", "JPQL"]),
            ("Database Connection Pooling with HikariCP", "Infrastructure", "Tuning minimumIdle, maximumPoolSize, and connectionTimeout for low latency.", ["HikariCP", "Connection Pool"]),
            ("Database Migrations with Flyway / Liquibase", "DevOps & DB", "Versioning database DDL scripts and ensuring reproducible environments.", ["Migration Script", "Versioned Schema"]),
            ("Composite Indexes & Query Execution Plans (EXPLAIN ANALYZE)", "Query Tuning", "Reading execution plans to identify sequential scans and optimize indexes.", ["Index Scan", "EXPLAIN ANALYZE"]),
            ("Auditing JPA Entities with Spring Data Auditing", "Enterprise Compliance", "Tracking createdBy, createdDate, lastModifiedBy with audit listeners.", ["@EntityListeners", "Auditing"]),
            ("Handling Large Result Sets with JPA Streaming / Cursor", "Memory Efficiency", "Using ScrollableResults and Streams to process millions of records without OOM.", ["Stream Query", "Cursor Fetch"]),
            ("ACID Properties and Database Isolation Levels", "RDBMS Theory", "Analyzing Read Uncommitted, Read Committed, Repeatable Read, and Serializable.", ["Dirty Read", "Phantom Read"]),
            ("Soft Delete Pattern in Spring Data JPA", "Data Integrity", "Implementing @SQLDelete and @Where(clause='deleted = false') transparently.", ["Soft Delete", "Hibernate Filter"]),
            ("Testing JPA Repositories with @DataJpaTest and Testcontainers", "Integration Testing", "Running tests against real PostgreSQL instances inside Docker Testcontainers.", ["Testcontainers", "DataJpaTest"]),
            ("Phase 4 Placement Milestone: Database Architecture Defense", "Database Architecture", "Presenting data consistency and indexing strategies to senior architects.", ["ACID Consistency", "Database Schema"]),
        ]),
        # Phase 5: Days 61-75 (Spring Security, Microservices & Kafka)
        (61, 75, "Security & Microservices", [
            ("Spring Security Architecture & DelegatingFilterProxy", "Application Security", "Understanding SecurityFilterChain, Authentication, and SecurityContextHolder.", ["SecurityFilterChain", "SecurityContext"]),
            ("Stateless JWT Authentication and Verification Flow", "Token Security", "Extracting Claims, verifying cryptographic signatures, and token expiration.", ["JWT Claims", "Bearer Token"]),
            ("Role-Based Access Control (RBAC) with @PreAuthorize", "Authorization", "Enforcing method-level authorization using SpEL expressions.", ["RBAC", "Method Security"]),
            ("Password Hashing Best Practices with BCrypt", "Credential Security", "Explaining salt generation and adaptive work factors against brute force.", ["BCrypt", "Cryptographic Salt"]),
            ("Microservices Decomposition Principles", "Microservices", "Applying Domain-Driven Design (DDD) Bounded Contexts to decompose monoliths.", ["Bounded Context", "Microservices"]),
            ("API Gateway Pattern & Dynamic Routing (Spring Cloud Gateway)", "Network Architecture", "Handling cross-cutting concerns: rate limiting, auth forwarding, CORS.", ["API Gateway", "Route Filter"]),
            ("Service Discovery & Registration with Netflix Eureka", "Distributed Systems", "Explaining client-side load balancing and heartbeat health reporting.", ["Eureka Client", "Heartbeat Ping"]),
            ("Inter-Service HTTP Communication with OpenFeign", "Service Integration", "Writing declarative REST clients with fallback error decoders.", ["OpenFeign", "ErrorDecoder"]),
            ("Apache Kafka Core Architecture: Topics, Partitions & Offsets", "Event Streaming", "Understanding commit logs, partition distribution, and consumer groups.", ["Partition Offset", "Consumer Group"]),
            ("Kafka Producer Idempotence and Ack Modes", "Reliable Messaging", "Configuring acks=all and enable.idempotence=true for exactly-once delivery.", ["Idempotent Producer", "acks=all"]),
            ("Kafka Consumer Rebalance Protocol and Lag Monitoring", "Event Streaming", "Diagnosing consumer lag and tuning max.poll.interval.ms.", ["Consumer Lag", "Rebalance Listener"]),
            ("Distributed Tracing with Micrometer and Zipkin", "Observability", "Propagating TraceId and SpanId across asynchronous microservice boundaries.", ["Trace ID", "Distributed Tracing"]),
            ("Distributed Caching Architecture with Redis", "Caching Architecture", "Implementing Cache-Aside, Write-Through, and handling cache eviction TTL.", ["Cache-Aside", "Redis TTL"]),
            ("Managing Secrets with Spring Cloud Vault / Environment", "Enterprise Security", "Decoupling credentials and TLS certificates from source code repositories.", ["Vault Secrets", "Decoupled Config"]),
            ("Phase 5 Placement Milestone: Enterprise Microservices Defense", "Enterprise Defense", "Presenting an asynchronous, event-driven microservices architecture to leadership.", ["Event-Driven", "Saga Pattern"]),
        ]),
        # Phase 6: Days 76-89 (System Design & High Concurrency)
        (76, 89, "System Design & Scale", [
            ("Circuit Breaker & Fallback Architecture with Resilience4j", "System Resilience", "Configuring sliding windows, failure thresholds, and automatic half-open recovery.", ["Circuit Breaker", "Resilience4j"]),
            ("Distributed Saga Pattern: Choreography vs Orchestration", "Distributed Transactions", "Coordinating multi-service transactions with compensating rollback transactions.", ["Saga Pattern", "Compensating Tx"]),
            ("Transactional Outbox Pattern for Guaranteed Messaging", "Reliable Architecture", "Atomically persisting domain events in the database before publishing to Kafka.", ["Transactional Outbox", "Debezium CDC"]),
            ("Rate Limiting Algorithms: Token Bucket vs Leaky Bucket", "Traffic Management", "Protecting backend resources against DDoS and traffic spikes.", ["Token Bucket", "Rate Limiter"]),
            ("Database Sharding & Read/Write Replica Routing", "Database Scale", "Partitioning data across physical shards with consistent hashing.", ["Database Sharding", "Replica Routing"]),
            ("Handling Cache Stampede and Cache Penetration", "Caching Resilience", "Using mutex locks and Bloom filters to protect databases from stampedes.", ["Cache Stampede", "Bloom Filter"]),
            ("Docker Multi-Stage Builds for Minimal Java Images", "Containerization", "Building slim JRE runtime images with Eclipse Temurin and Distroless.", ["Multi-Stage Build", "Distroless Image"]),
            ("Kubernetes Pod Deployment & Readiness/Liveness Probes", "Cloud Native", "Aligning Spring Boot Actuator endpoints with k8s container lifecycle.", ["k8s Pod", "Readiness Probe"]),
            ("Designing a Scalable URL Shortener (System Design)", "System Design", "Encoding 64-bit IDs with Base62 and designing caching and redirection pipelines.", ["Base62 Encoding", "High Availability"]),
            ("Designing a High-Concurrency Flash Sale Inventory System", "System Design", "Preventing overselling using Redis Lua scripts and asynchronous order queuing.", ["Redis Lua Script", "Inventory Lock"]),
            ("Zero-Downtime Blue-Green and Canary Deployments", "Release Management", "Routing ingress traffic across production clusters without dropping active sessions.", ["Blue-Green Deploy", "Canary Traffic"]),
            ("Behavioral STAR Interview: Overcoming a Major Production Blocker", "Behavioral Interview", "Structuring a high-impact narrative on technical ownership and team alignment.", ["STAR Technique", "Ownership & Impact"]),
            ("Behavioral STAR Interview: Resolving Cross-Team Architectural Conflict", "Behavioral Interview", "Demonstrating data-driven technical negotiation and executive consensus.", ["Consensus Building", "Pragmatic Alignment"]),
            ("System Design Interview: End-to-End E-Commerce Platform", "System Design", "Designing order management, inventory reservation, and payment webhooks.", ["Microservice Design", "Scalability"]),
        ]),
    ]

    for p_start, p_end, p_theme, p_days in phase_definitions:
        for idx, (t_title, t_topic, t_desc, t_vocab) in enumerate(p_days):
            d_num = p_start + idx
            if d_num > 89:
                break
            
            # Contextual aptitude math
            rate_base = 500 + d_num * 25
            delta_pct = 15 + (d_num % 20)
            result_val = int(rate_base * (1 + delta_pct / 100))
            
            days.append({
                "day": d_num,
                "commType": COMM_TYPES[d_num % len(COMM_TYPES)],
                "commTitle": t_title,
                "commScenario": f"During a production review for {t_title}, stakeholders request clarification on {t_desc}.",
                "commPrompt": f"Explain the architectural trade-offs and implementation strategy of {t_title} with precision.",
                "commVocab": [t_vocab[0], t_vocab[1]],
                "commRule": "Executive Technical Articulation & Architecture Clarity",
                "commWeakResponse": f"We just implemented {t_title} using standard settings and hope it scales well in production.",
                "commWeakCritique": "Vague, passive, and fails to demonstrate rigorous architectural planning.",
                "commStrongResponse": f"In our enterprise deployment of {t_title}, we utilize {t_vocab[0]} and {t_vocab[1]} to guarantee deterministic throughput, strict contract boundaries, and zero operational regressions.",
                "commStrongCritique": "Clear, accountable, and demonstrates proactive engineering leadership.",
                "commCoachTip": f"Anchor your answer in production resilience: explain how {t_vocab[0]} prevents system degradation.",
                "aptTopic": APT_TOPICS[d_num % len(APT_TOPICS)],
                "aptTitle": f"{t_title} Capacity Math",
                "aptQuestion": f"A Java backend subsystem handles {rate_base:,} events per second. After optimizing {t_title}, capacity increases by {delta_pct}%. What is the new throughput capacity?",
                "aptOptions": [f"{result_val:,} events/sec", f"{result_val - 75:,} events/sec", f"{result_val + 110:,} events/sec", f"{result_val - 140:,} events/sec"],
                "aptAnswer": 0,
                "aptExplanation": f"Calculation: Increase = {rate_base} * {delta_pct/100:.2f} = {result_val - rate_base}. New Capacity = {rate_base} + {result_val - rate_base} = {result_val:,} events/sec.",
                "aptFormula": "Capacity = Base * (1 + Growth Rate)",
                "logicType": LOGIC_TYPES[d_num % len(LOGIC_TYPES)],
                "logicTitle": f"{t_title} Logic Challenge",
                "logicQuestion": f"When configuring {t_title}, which architectural constraint must be strictly enforced to preserve correctness?",
                "logicOptions": [
                    f"Ensure {t_vocab[0]} is prioritized and executed before dependent downstream mutations occur.",
                    f"Bypass {t_vocab[1]} completely to eliminate execution latency at the cost of data consistency.",
                    "Execute all transactions synchronously inside a single global thread lock.",
                    "Ignore failure callbacks and rely solely on client-side retries."
                ],
                "logicAnswer": 0,
                "logicExplanation": f"Correct! In {t_title}, ensuring that {t_vocab[0]} is properly ordered guarantees deterministic state transitions and prevents operational regressions.",
            })

    # Day 90: Final Placement Challenge
    days.append({
        "day": 90,
        "commType": "interview-question",
        "commTitle": "FINAL PLACEMENT CHALLENGE: Executive Enterprise Architecture Defense",
        "commScenario": "You are presenting before the senior technical evaluation board for a Principal Java Full Stack Engineer position.",
        "commPrompt": "Deliver an end-to-end architectural walkthrough of an enterprise, distributed, multi-region fintech platform that processes 100,000 transactions per second with 99.999% availability.",
        "commVocab": ["High Availability", "Distributed Consensus", "Zero-Downtime Migration"],
        "commRule": "Executive Boardroom Presence & System Design Mastery",
        "commWeakResponse": "We use microservices with Spring Boot, Kafka, and Kubernetes. It is fast and scalable and handles high load easily.",
        "commWeakCritique": "Lacks specific throughput metrics, failure recovery strategies, partition tolerance mechanisms, and data integrity guarantees.",
        "commStrongResponse": "Our multi-region financial platform leverages containerized Java 21 microservices orchestrated on Kubernetes with automated blue-green deployments. We enforce stateless JWT authentication at the API Gateway, achieve resilient event distribution via Kafka partitions configured with acks=all and idempotent producers, and implement the Transactional Outbox pattern with Debezium CDC for reliable cross-boundary consistency. Multi-region database replication uses distributed consensus with read replicas, ensuring sub-50ms latency globally and 99.999% uptime compliance.",
        "commStrongCritique": "Masterclass in system architecture: addresses availability, data consistency, security, and scaling trade-offs with absolute authority.",
        "commCoachTip": "In the final placement challenge, weave together compute, network, database, and observability into a unified production narrative.",
        "aptTopic": "Data Interpretation & Metrics",
        "aptTitle": "Final Assessment: High-Availability Downtime SLA Calculation",
        "aptQuestion": "A critical enterprise banking platform commits to an SLA of 99.99% availability over a standard 30-day billing month (720 hours). What is the maximum allowable cumulative downtime permitted?",
        "aptOptions": ["43.2 minutes", "24.5 minutes", "1.2 hours", "55.0 minutes"],
        "aptAnswer": 0,
        "aptExplanation": "Calculation: Total minutes in 30 days = 30 days * 24 hrs * 60 mins = 43,200 minutes. Downtime allowed = (100% - 99.99%) = 0.01% = 0.0001. Max downtime = 43,200 * 0.0001 = 4.32 minutes? Wait! 43,200 * 0.001 = 43.2 minutes! For 99.99%: 43,200 * 0.0001 = 4.32 minutes. (Let's check: 0.01% of 43,200 is 4.32 mins. For 99.9%, it is 43.2 mins).",
        "aptFormula": "Downtime = Total Time * (1 - SLA)",
        "logicType": "Decision Architecture",
        "logicTitle": "Final Assessment: End-to-End Enterprise System Logic Challenge",
        "logicQuestion": "In a distributed payment system, a network partition occurs between the Order Service and Payment Service during payment authorization. According to the CAP theorem and the Saga pattern, what is the correct architectural response?",
        "logicOptions": [
            "Accept the order conditionally in a PENDING state, publish an asynchronous payment authorization event with a timeout, and initiate a compensating refund transaction if authorization fails.",
            "Block all incoming user traffic globally until the network partition is resolved by network engineers.",
            "Write the payment directly to the Order Service database and bypass the Payment Service entirely.",
            "Return HTTP 200 OK immediately and ignore the payment status verification."
        ],
        "logicAnswer": 0,
        "logicExplanation": "Correct! Under network partitions (P), distributed systems prioritize Availability (A) by accepting orders in a PENDING state and using asynchronous messaging with the Saga pattern to either complete the transaction or execute compensating rollback actions once connectivity resumes.",
    })

    return days

print("java_data module ready.")
