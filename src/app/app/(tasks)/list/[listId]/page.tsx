"use client";

import { use } from "react";
import { TaskBoard } from "@/modules/tasks/components/task-board";
import { useLists } from "@/modules/tasks/queries/lists";

export default function ListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = use(params);
  const { data: lists } = useLists();
  const list = lists?.find((l) => l.id === listId);

  return (
    <TaskBoard view={{ type: "list", listId }} title={list?.name ?? "Lista"} />
  );
}
