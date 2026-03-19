import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How can I contact support?",
    answer:
      "You can contact support via call or email from the Contact Us page.",
  },
  {
    question: "How long does it take to get a response?",
    answer: "Typically within 24 hours.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use secure encryption and authentication methods.",
  },
  {
    question: "Can I track my reports?",
    answer: "Yes, you can track reports in real-time within the app.",
  },
  {
    question: "How do I reset my password?",
    answer: 'Use the "Forgot Password" option on the login screen.',
  },
];

const FAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex((previous) => (previous === index ? null : index));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Frequently Asked Questions</Text>

      <View style={styles.faqList}>
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = activeIndex === index;

          return (
            <View key={item.question} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.questionButton}
                activeOpacity={0.85}
                onPress={() => handleToggle(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={item.question}
                accessibilityHint="Double tap to expand or collapse the answer"
                accessibilityState={{ expanded: isOpen }}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.indicator}>{isOpen ? "-" : "+"}</Text>
              </TouchableOpacity>

              {isOpen ? (
                <Text style={styles.answerText}>{item.answer}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#DDE0E6",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111631",
    marginBottom: 18,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: "#F4F6FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D4DAE3",
    overflow: "hidden",
  },
  questionButton: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#171C2E",
    paddingRight: 10,
    lineHeight: 21,
  },
  indicator: {
    fontSize: 22,
    fontWeight: "600",
    color: "#545F74",
    lineHeight: 24,
    marginTop: -2,
  },
  answerText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#647086",
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: -2,
  },
});

export default FAQPage;
