/**
 * Ultimate Brain Flip Experience - Cognitive Analytics Stream Processor
 * Real-time processing of cognitive performance data
 */

package com.brainflip.streams.processors;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.*;
import org.apache.kafka.streams.state.Stores;
import org.apache.kafka.streams.state.WindowStore;

import com.brainflip.streams.models.*;
import com.brainflip.streams.serdes.JsonSerdes;
import com.brainflip.streams.transformers.CognitiveMetricsTransformer;
import com.brainflip.streams.aggregators.PerformanceAggregator;

import java.time.Duration;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;

/**
 * Processes instruction responses and game events to generate real-time cognitive analytics
 */
public class CognitiveAnalyticsProcessor {
    
    private static final String APPLICATION_ID = "brain-flip-cognitive-analytics";
    private static final String BOOTSTRAP_SERVERS = "kafka-1:9092,kafka-2:9092,kafka-3:9092";
    
    // Topic names
    private static final String INSTRUCTION_RESPONSES_TOPIC = "brain-flip.instruction.responses";
    private static final String GAME_EVENTS_TOPIC = "brain-flip.game.events";
    private static final String COGNITIVE_METRICS_TOPIC = "brain-flip.cognitive.metrics";
    private static final String COGNITIVE_ALERTS_TOPIC = "brain-flip.cognitive.alerts";
    private static final String USER_PROFILES_TOPIC = "brain-flip.user.profiles";
    
    // State store names
    private static final String USER_PERFORMANCE_STORE = "user-performance-store";
    private static final String COGNITIVE_BASELINE_STORE = "cognitive-baseline-store";
    private static final String ANOMALY_DETECTION_STORE = "anomaly-detection-store";
    
    public static void main(String[] args) {
        Properties props = createStreamProperties();
        
        StreamsBuilder builder = new StreamsBuilder();
        buildTopology(builder);
        
        Topology topology = builder.build();
        System.out.println("Topology Description:");
        System.out.println(topology.describe());
        
        KafkaStreams streams = new KafkaStreams(topology, props);
        
        // Graceful shutdown
        CountDownLatch latch = new CountDownLatch(1);
        Runtime.getRuntime().addShutdownHook(new Thread("streams-shutdown-hook") {
            @Override
            public void run() {
                streams.close();
                latch.countDown();
            }
        });
        
        try {
            streams.start();
            latch.await();
        } catch (Throwable e) {
            System.exit(1);
        }
        System.exit(0);
    }
    
    private static Properties createStreamProperties() {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, APPLICATION_ID);
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS);
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, JsonSerdes.InstructionResponse().getClass());
        props.put(StreamsConfig.COMMIT_INTERVAL_MS_CONFIG, 1000);
        props.put(StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG, 10 * 1024 * 1024L);
        props.put(StreamsConfig.NUM_STREAM_THREADS_CONFIG, 4);
        props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, StreamsConfig.EXACTLY_ONCE_V2);
        props.put(StreamsConfig.TOPOLOGY_OPTIMIZATION_CONFIG, StreamsConfig.OPTIMIZE);
        
        return props;
    }
    
    private static void buildTopology(StreamsBuilder builder) {
        // Create state stores
        createStateStores(builder);
        
        // Input streams
        KStream<String, InstructionResponse> instructionResponses = builder
            .stream(INSTRUCTION_RESPONSES_TOPIC, Consumed.with(Serdes.String(), JsonSerdes.InstructionResponse()));
            
        KStream<String, GameEvent> gameEvents = builder
            .stream(GAME_EVENTS_TOPIC, Consumed.with(Serdes.String(), JsonSerdes.GameEvent()));
        
        // Process instruction responses for cognitive metrics
        KStream<String, CognitiveMetrics> cognitiveMetrics = instructionResponses
            .filter((key, response) -> response != null && response.getUserId() != null)
            .selectKey((key, response) -> response.getUserId())
            .transformValues(
                () -> new CognitiveMetricsTransformer(),
                USER_PERFORMANCE_STORE,
                COGNITIVE_BASELINE_STORE
            );
        
        // Aggregate performance metrics by user and time window
        KTable<Windowed<String>, PerformanceAggregate> performanceAggregates = instructionResponses
            .filter((key, response) -> response != null && response.getUserId() != null)
            .selectKey((key, response) -> response.getUserId())
            .groupByKey(Grouped.with(Serdes.String(), JsonSerdes.InstructionResponse()))
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)).grace(Duration.ofMinutes(1)))
            .aggregate(
                PerformanceAggregate::new,
                new PerformanceAggregator(),
                Materialized.<String, PerformanceAggregate, WindowStore<Bytes, byte[]>>as("performance-aggregates")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(JsonSerdes.PerformanceAggregate())
                    .withRetention(Duration.ofHours(24))
            );
        
        // Detect cognitive anomalies
        KStream<String, CognitiveAlert> cognitiveAlerts = cognitiveMetrics
            .filter((userId, metrics) -> detectCognitiveAnomaly(metrics))
            .mapValues(metrics -> createCognitiveAlert(metrics));
        
        // Real-time flow state detection
        KStream<String, FlowStateEvent> flowStateEvents = instructionResponses
            .filter((key, response) -> response != null)
            .selectKey((key, response) -> response.getUserId())
            .groupByKey(Grouped.with(Serdes.String(), JsonSerdes.InstructionResponse()))
            .windowedBy(SessionWindows.with(Duration.ofMinutes(30)))
            .aggregate(
                FlowStateAnalyzer::new,
                (userId, response, analyzer) -> analyzer.addResponse(response),
                (userId, analyzer1, analyzer2) -> analyzer1.merge(analyzer2),
                Materialized.<String, FlowStateAnalyzer, SessionStore<Bytes, byte[]>>as("flow-state-sessions")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(JsonSerdes.FlowStateAnalyzer())
            )
            .toStream()
            .filter((windowedUserId, analyzer) -> analyzer.isFlowStateDetected())
            .map((windowedUserId, analyzer) -> KeyValue.pair(
                windowedUserId.key(),
                new FlowStateEvent(windowedUserId.key(), analyzer.getFlowStateScore(), System.currentTimeMillis())
            ));
        
        // Cognitive load analysis
        KStream<String, CognitiveLoadMetrics> cognitiveLoadStream = instructionResponses
            .filter((key, response) -> response != null && response.getReactionTime() > 0)
            .selectKey((key, response) -> response.getUserId())
            .groupByKey(Grouped.with(Serdes.String(), JsonSerdes.InstructionResponse()))
            .windowedBy(TimeWindows.of(Duration.ofMinutes(1)).grace(Duration.ofSeconds(30)))
            .aggregate(
                CognitiveLoadCalculator::new,
                (userId, response, calculator) -> calculator.addResponse(response),
                Materialized.<String, CognitiveLoadCalculator, WindowStore<Bytes, byte[]>>as("cognitive-load-window")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(JsonSerdes.CognitiveLoadCalculator())
            )
            .toStream()
            .mapValues(calculator -> calculator.calculateMetrics());
        
        // Learning curve analysis
        KTable<String, LearningCurveMetrics> learningCurves = instructionResponses
            .filter((key, response) -> response != null && response.getUserId() != null)
            .selectKey((key, response) -> response.getUserId())
            .groupByKey(Grouped.with(Serdes.String(), JsonSerdes.InstructionResponse()))
            .aggregate(
                LearningCurveAnalyzer::new,
                (userId, response, analyzer) -> analyzer.addResponse(response),
                Materialized.<String, LearningCurveAnalyzer>as("learning-curves")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(JsonSerdes.LearningCurveAnalyzer())
            )
            .mapValues(analyzer -> analyzer.calculateMetrics());
        
        // Attention span analysis
        KStream<String, AttentionMetrics> attentionMetrics = gameEvents
            .filter((key, event) -> "session_pause".equals(event.getEventType()) || 
                                   "session_resume".equals(event.getEventType()) ||
                                   "focus_lost".equals(event.getEventType()) ||
                                   "focus_gained".equals(event.getEventType()))
            .selectKey((key, event) -> event.getUserId())
            .groupByKey(Grouped.with(Serdes.String(), JsonSerdes.GameEvent()))
            .windowedBy(SessionWindows.with(Duration.ofHours(2)))
            .aggregate(
                AttentionAnalyzer::new,
                (userId, event, analyzer) -> analyzer.addEvent(event),
                (userId, analyzer1, analyzer2) -> analyzer1.merge(analyzer2),
                Materialized.<String, AttentionAnalyzer, SessionStore<Bytes, byte[]>>as("attention-sessions")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(JsonSerdes.AttentionAnalyzer())
            )
            .toStream()
            .mapValues(analyzer -> analyzer.calculateMetrics());
        
        // Output streams
        cognitiveMetrics.to(COGNITIVE_METRICS_TOPIC, Produced.with(Serdes.String(), JsonSerdes.CognitiveMetrics()));
        cognitiveAlerts.to(COGNITIVE_ALERTS_TOPIC, Produced.with(Serdes.String(), JsonSerdes.CognitiveAlert()));
        
        // Additional output topics for specialized metrics
        flowStateEvents.to("brain-flip.flow.state.events", Produced.with(Serdes.String(), JsonSerdes.FlowStateEvent()));
        cognitiveLoadStream.to("brain-flip.cognitive.load.metrics", Produced.with(Serdes.String(), JsonSerdes.CognitiveLoadMetrics()));
        learningCurves.toStream().to("brain-flip.learning.curves", Produced.with(Serdes.String(), JsonSerdes.LearningCurveMetrics()));
        attentionMetrics.to("brain-flip.attention.metrics", Produced.with(Serdes.String(), JsonSerdes.AttentionMetrics()));
        
        // Performance aggregates for dashboards
        performanceAggregates
            .toStream()
            .map((windowedUserId, aggregate) -> KeyValue.pair(
                windowedUserId.key(),
                new PerformanceSnapshot(
                    windowedUserId.key(),
                    windowedUserId.window().start(),
                    windowedUserId.window().end(),
                    aggregate
                )
            ))
            .to("brain-flip.performance.snapshots", Produced.with(Serdes.String(), JsonSerdes.PerformanceSnapshot()));
    }
    
    private static void createStateStores(StreamsBuilder builder) {
        // User performance history store
        builder.addStateStore(
            Stores.keyValueStoreBuilder(
                Stores.persistentKeyValueStore(USER_PERFORMANCE_STORE),
                Serdes.String(),
                JsonSerdes.UserPerformanceHistory()
            )
        );
        
        // Cognitive baseline store
        builder.addStateStore(
            Stores.keyValueStoreBuilder(
                Stores.persistentKeyValueStore(COGNITIVE_BASELINE_STORE),
                Serdes.String(),
                JsonSerdes.CognitiveBaseline()
            )
        );
        
        // Anomaly detection store
        builder.addStateStore(
            Stores.keyValueStoreBuilder(
                Stores.persistentKeyValueStore(ANOMALY_DETECTION_STORE),
                Serdes.String(),
                JsonSerdes.AnomalyDetectionState()
            )
        );
    }
    
    private static boolean detectCognitiveAnomaly(CognitiveMetrics metrics) {
        // Implement anomaly detection logic
        // Check for significant deviations from baseline performance
        
        if (metrics.getReactionTime() > metrics.getBaselineReactionTime() * 2.0) {
            return true; // Reaction time anomaly
        }
        
        if (metrics.getAccuracy() < metrics.getBaselineAccuracy() * 0.5) {
            return true; // Accuracy anomaly
        }
        
        if (metrics.getCognitiveLoad() > 0.9) {
            return true; // High cognitive load
        }
        
        if (metrics.getFatigueLevel() > 0.8) {
            return true; // High fatigue
        }
        
        return false;
    }
    
    private static CognitiveAlert createCognitiveAlert(CognitiveMetrics metrics) {
        CognitiveAlert alert = new CognitiveAlert();
        alert.setUserId(metrics.getUserId());
        alert.setTimestamp(System.currentTimeMillis());
        alert.setSeverity(determineSeverity(metrics));
        alert.setAlertType(determineAlertType(metrics));
        alert.setMessage(generateAlertMessage(metrics));
        alert.setMetrics(metrics);
        
        return alert;
    }
    
    private static String determineSeverity(CognitiveMetrics metrics) {
        if (metrics.getCognitiveLoad() > 0.9 || metrics.getFatigueLevel() > 0.9) {
            return "HIGH";
        } else if (metrics.getCognitiveLoad() > 0.7 || metrics.getFatigueLevel() > 0.7) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    private static String determineAlertType(CognitiveMetrics metrics) {
        if (metrics.getReactionTime() > metrics.getBaselineReactionTime() * 2.0) {
            return "REACTION_TIME_ANOMALY";
        } else if (metrics.getAccuracy() < metrics.getBaselineAccuracy() * 0.5) {
            return "ACCURACY_DECLINE";
        } else if (metrics.getCognitiveLoad() > 0.9) {
            return "HIGH_COGNITIVE_LOAD";
        } else if (metrics.getFatigueLevel() > 0.8) {
            return "FATIGUE_DETECTED";
        } else {
            return "GENERAL_PERFORMANCE_DECLINE";
        }
    }
    
    private static String generateAlertMessage(CognitiveMetrics metrics) {
        String alertType = determineAlertType(metrics);
        
        switch (alertType) {
            case "REACTION_TIME_ANOMALY":
                return String.format("Reaction time (%.2fms) is significantly higher than baseline (%.2fms)", 
                    metrics.getReactionTime(), metrics.getBaselineReactionTime());
            case "ACCURACY_DECLINE":
                return String.format("Accuracy (%.2f%%) has dropped significantly below baseline (%.2f%%)", 
                    metrics.getAccuracy() * 100, metrics.getBaselineAccuracy() * 100);
            case "HIGH_COGNITIVE_LOAD":
                return String.format("Cognitive load is very high (%.2f). Consider taking a break.", 
                    metrics.getCognitiveLoad());
            case "FATIGUE_DETECTED":
                return String.format("High fatigue level detected (%.2f). Rest is recommended.", 
                    metrics.getFatigueLevel());
            default:
                return "General performance decline detected. Consider adjusting difficulty or taking a break.";
        }
    }
}