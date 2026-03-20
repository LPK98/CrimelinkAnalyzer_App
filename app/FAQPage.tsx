import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
    question: "faq.q1",
    answer: "faq.a1",
  },
  {
    question: "faq.q2",
    answer: "faq.a2",
  },
  {
    question: "faq.q3",
    answer: "faq.a3",
  },
  {
    question: "faq.q4",
    answer: "faq.a4",
  },
  {
    question: "faq.q5",
    answer: "faq.a5",
  },
];

const FAQPage: React.FC = () => {
  const { t } = useTranslation();
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
      <Text style={styles.title}>{t("faq.title")}</Text>

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
                accessibilityLabel={t(item.question)}
                accessibilityHint="Double tap to expand or collapse the answer"
                accessibilityState={{ expanded: isOpen }}
              >
                <Text style={styles.questionText}>{t(item.question)}</Text>
                <Text style={styles.indicator}>{isOpen ? "-" : "+"}</Text>
              </TouchableOpacity>

              {isOpen ? (
                <Text style={styles.answerText}>{t(item.answer)}</Text>
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
